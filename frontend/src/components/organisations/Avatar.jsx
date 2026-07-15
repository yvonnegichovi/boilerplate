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
        return <img className="avatar" src={src} alt={name} style={style} />
    }

    return (
        <div className="avatar avatar-initials" style={style}>
            {initials}
        </div>
    )
}
