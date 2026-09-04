export default function Avatar({ src, name, size = 36 }) {
    const initials = (name || '?')
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const style = { width: size, height: size, fontSize: size * 0.4 }

    if (src) {
        return (
            <img
                className="rounded-full object-cover flex-shrink-0 border border-purple-100"
                src={src}
                alt={name}
                style={style}
            />
        )
    }

    return (
        <div
            className="rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white bg-gradient-to-tr from-purple-600 to-indigo-500 tracking-wide"
            style={style}
        >
            {initials}
        </div>
    )
}
