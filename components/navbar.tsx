import React from 'react';
import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/navitems";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer">
                    <Image src="/images/logo.svg" alt="Logo" width={46} height={46} className="rounded-xl border border-gray-200" />
                </div>
            </Link>
            <div className="flex items-center gap-8">
               <NavItems />
            </div>
        </nav>
    );
};

export default Navbar;