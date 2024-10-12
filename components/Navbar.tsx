import Image from "next/image"
import Link from "next/link"


const NavBar = () => {
    return (
        <header className="w-full">
            <nav className="nav">
                <Link href='/' className="flex items-center gap-1">
                    <Image src='/assets/icons/logo.svg' width={27} height={27} quality={100} alt="Trackazon logo" />
                    <p className="nav-logo">Track<span className="text-primary">azon</span></p>
                </Link>
            </nav>
        </header>
    )
}

export default NavBar