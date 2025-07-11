export const Card = ({children}: {children: React.ReactNode}) => {
	return (
		<div className="bg-white dark:bg-neutral-700 shadow-md rounded-lg p-4">
			{children}
		</div>
	)    
}

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="grid grid-cols-2 gap-4 p-2 justify-center ">
			{children}
		</div>
	);
}