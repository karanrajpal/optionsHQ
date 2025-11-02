export const PageHeader = ({
    header,
    subheader,
    rightElement,
}: {
    header: string;
    subheader?: string;
    rightElement?: React.ReactNode;
}) => {
    return (
        <div className="space-y-1 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">{header}</h1>
                {rightElement && <div className="mt-2 sm:mt-0">{rightElement}</div>}
            </div>
            {subheader && <p className="text-gray-600 dark:text-gray-400 mt-1">{subheader}</p>}
        </div>
    );
};