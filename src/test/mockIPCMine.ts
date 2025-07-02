import { InvokeArgs, InvokeOptions } from "@tauri-apps/api/core";
import { EventName } from "@tauri-apps/api/event";

function mockInternals() {
  window.__TAURI_INTERNALS__ = window.__TAURI_INTERNALS__ ?? {}
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = window.__TAURI_EVENT_PLUGIN_INTERNALS__ ?? {}
}

export function mockIPC(
  cb: (cmd: string, payload?: InvokeArgs) => unknown
): void {
  mockInternals()


  function isEventPluginInvoke(cmd: string): boolean {
    return cmd.startsWith('plugin:event|');
  }

  function handleEventPlugin(cmd: string, args?: InvokeArgs): unknown {
    switch (cmd.split('|')[1]) {
      case 'listen':
        return handleListen(args as {event: EventName, handler: number});
      case 'emit':
        return handleEmit(args as {event: EventName, payload?: unknown});
      case 'unlisten':
        return handleRemoveListener(args as {event: EventName, id: number});
    }
  }

  const listeners = new Map<string, number[]>();
  function handleListen(args: { event: EventName, handler: number }) {
    if (!listeners.has(args.event)) {
      listeners.set(args.event, []);
    }
    // return the id (index) of the handler
    listeners.get(args.event)!.push(args.handler);
    return args.handler;
  }

  function handleEmit(args: { event: EventName, payload?: unknown }) {
    const eventListeners = listeners.get(args.event) || [];
    for (const handler of eventListeners) {
      runCallback(handler, args);
    }
    return null;
  }
  function handleRemoveListener(args: { event: EventName, id: number }) {
    const eventListeners = listeners.get(args.event);
    if (eventListeners) {
      const index = eventListeners.indexOf(args.id);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }


  // eslint-disable-next-line @typescript-eslint/require-await
  async function invoke<T>(
    cmd: string,
    args?: InvokeArgs,
    _options?: InvokeOptions
  ): Promise<T> {

    if (isEventPluginInvoke(cmd)) {
      return handleEventPlugin(cmd, args) as T;
    }

    return cb(cmd, args) as T
  }

  const callbacks = new Map<number, (data: unknown) => void>()

  function registerCallback<T = unknown>(
    callback?: (response: T) => void,
    once = false
  ) {
    const identifier = window.crypto.getRandomValues(new Uint32Array(1))[0]
    callbacks.set(identifier, (data) => {
      if (once) {
        unregisterCallback(identifier)
      }
      return callback && callback(data as T)
    })
    return identifier
  }

  function unregisterCallback(id: number) {
    callbacks.delete(id)
  }

  function runCallback(id: number, data: unknown) {
    const callback = callbacks.get(id)
    if (callback) {
      callback(data)
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `[TAURI] Couldn't find callback id ${id}. This might happen when the app is reloaded while Rust is running an asynchronous operation.`
      )
    }
  }

  function unregisterListener(event: EventName, id: number) {
    unregisterCallback(id);
  }

  window.__TAURI_INTERNALS__.invoke = invoke
  window.__TAURI_INTERNALS__.transformCallback = registerCallback
  window.__TAURI_INTERNALS__.unregisterCallback = unregisterCallback
  window.__TAURI_INTERNALS__.runCallback = runCallback
  window.__TAURI_INTERNALS__.callbacks = callbacks
  window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener = unregisterListener
}