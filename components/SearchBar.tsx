"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const isValidAmazonProductUrl = (url: string) => {
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname;

        if (hostname.includes('amazon.com') || hostname.includes('amazon.') || hostname.endsWith('amazon')) {
            return true;
        }
    } catch (error) {
        return false;
    }

    return false;
}

const SearchBar = () => {
    const [searchPrompt, setSearchPromt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const router = useRouter();

    const notify = (text: string) => toast.error(text, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isValidLink = isValidAmazonProductUrl(searchPrompt);

        if (!isValidLink) {
            setIsError(true);
            notify('Please enter a valid Amazon link')
            return;
        };

        let res;

        try {
            setIsLoading(true);

            const product = await scrapeAndStoreProduct(searchPrompt);
            res = product;
        } catch (error) {
            setIsError(true);
            notify('An error has occured, please try again later')
            console.log(error);
        } finally {
            setSearchPromt('');
            setIsLoading(false);
            if (res) {
                router.push(res)
            }
        }
    }
    return (
        <form className="flex flex-wrap gap-4 mt-14" onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter amazon product link" className={isError ? 'searchbar-input outline-red-500 outline-dashed bg-red-200' : 'searchbar-input'} value={searchPrompt} onChange={(e) => {
                setSearchPromt(e.target.value);
                if (isError) setIsError(false);
            }} />
            <button type="submit" className="searchbar-btn" disabled={searchPrompt === '' || isLoading}>{isLoading ? 'Searching...' : 'Search'}</button>
            <ToastContainer
                position="bottom-right"
                autoClose={4997}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </form>
    )
}

export default SearchBar;