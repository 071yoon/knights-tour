export default function Title({title}: {title: string}) {
    return (
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
        </h1>
    )
}