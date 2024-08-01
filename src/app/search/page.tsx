'use client';

import React, {SetStateAction, useEffect, useState} from 'react';

import { Navbar }                                   from "@/app/components/Navbar";
import { Footer }                                   from "@/app/components/Footer";

const FLAVOR_KEY_WORDS = [
    'effortlessly',
    'beyond',
    'osint',
    'data',
    'free',
    'find',
    'zero',
    'full',
    'web',
    'no'
];

const BubbleText = () => {
    useEffect(() => {
        const spans = document.querySelectorAll(".hover-text span") as NodeListOf<HTMLSpanElement>;

        spans.forEach((span) => {
            span.addEventListener("mouseenter", function (this: typeof span) {
                this.style.fontWeight = "900";
                this.style.color = "rgb(238, 242, 255)";

                const leftNeighbor = this.previousElementSibling as HTMLSpanElement;
                const rightNeighbor = this.nextElementSibling as HTMLSpanElement;

                if (leftNeighbor) {
                    leftNeighbor.style.fontWeight = "500";
                    leftNeighbor.style.color = "rgb(199, 210, 254)";
                }
                if (rightNeighbor) {
                    rightNeighbor.style.fontWeight = "500";
                    rightNeighbor.style.color = "rgb(199, 210, 254)";
                }
            });

            span.addEventListener("mouseleave", function (this: typeof span) {
                this.style.fontWeight = "100";
                this.style.color = "rgb(165, 180, 252)";

                const leftNeighbor = this.previousElementSibling as HTMLSpanElement;
                const rightNeighbor = this.nextElementSibling as HTMLSpanElement;

                if (leftNeighbor) {
                    leftNeighbor.style.fontWeight = "100";
                    leftNeighbor.style.color = "rgb(165, 180, 252)";
                }

                if (rightNeighbor) {
                    rightNeighbor.style.fontWeight = "100";
                    rightNeighbor.style.color = "rgb(165, 180, 252)";
                }
            });
        });
    }, []);

    return (
        <h2 className="hover-text text-center text-5xl font-thin text-[#331E84]">
            <Text>Nitrous</Text>
        </h2>
    );
};

const Text = ({ children }: { children: string }) => {
    return (
        <>
            {children.split("").map((child, idx) => (
                <span
                    style={{
                        transition: "0.35s font-weight, 0.35s color",
                    }}
                    key={idx}
                >
                    {child}
                </span>
            ))}
        </>
    );
};

/*
    @type function
    @returns : array of strings
    @desc    : gets the categories from the apis main indexing endpoint
 */
const getButtonCategories = async () => {
    let categories: string[] = [];

    const res = await fetch('https://api.nitrous-oxi.de/');

    // returns an array of objects, each one has a 'category' property which we use to form our list
    const data = await res.json();
    data.forEach((obj: { category: string }) => {
        categories.push(obj.category)
    });

    return categories;
}

/*
    @type function
    @returns : array of strings
    @desc    : gets flavor texts out of the assets repo
 */
const getFlavorTexts = async () => {
    let flavors: string[] = [];

    const res = await fetch('https://raw.githubusercontent.com/nitrous-oxi-de/.github/main/assets/txt/flavors.txt');
    const data = await res.text();

    // split by new line
    const lines = data.split('\n');
    lines.forEach((line: string) => {
        flavors.push(line);
    });

    // shuffle the array
    flavors.sort(() => Math.random() - 0.5);

    return flavors;
}

/*
    @type function
    @param query    : string
    @param category : string
    @returns        : array of objects [{name: string, data: object}]
    @desc           : queries the api and returns the data
 */
const queryAPI = async (query: string, category: string) => {
    const res = await fetch(`https://api.nitrous-oxi.de/${category}?query=${query}`);
    return await res.json();
}

// Main Search Component
export default function Search() {

    const [flavorTexts, setFlavorTexts]           = useState<string[]>(['']);

    const [errorMessage, setErrorMessage]         = useState(null);
    const [loading, setLoading]                   = useState(false);

    const [buttonCategories, setButtonCategories] = useState<string[]>([]);
    const [selectedButton, setSelectedButton]     = useState('Email');

    const [results, setResults]                   = useState<any[]>([]);
    const [query, setQuery]                       = useState('');

    const handleSearch = async () => {
        let data: any[] = [];

        setLoading(true); setErrorMessage(null); setResults([]);

        const res = await queryAPI(query, selectedButton);

        if (res.error) { setErrorMessage(res.error); }

        else if (res.status === 400) { setErrorMessage(res.data); }

        else {
            // map the objects returned by the api
            res.forEach((obj: { name: string; data: any; }) => {

                // if the module returned a 200 status code, add it to the data array
                if (obj.data.status === 200) { data.push({name: obj.name, data: obj.data}) }
            });

            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const blob      = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url       = URL.createObjectURL(blob);
            const a         = document.createElement('a');

            a.download      = `${query}-${timestamp}.json`;
            a.href          = url;

            a.click(); a.remove();

           setResults(data);
        }

        setLoading(false);
    }

    // TODO: look into SWR for data fetching
    useEffect(() => {
        getFlavorTexts().then((res) => setFlavorTexts(res));
        getButtonCategories().then((res) => setButtonCategories(res));
    }, []);

    const handleButtonChange = (name: SetStateAction<string>) => {
      if (!loading)
        setSelectedButton(name);
    }

    return (
        <div>
            <Navbar />
            {/* background and layout */}
            <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,black_1px)] bg-[size:20px_20px]"></div>
            <div className="mx-auto w-screen h-screen px-6 pb-10 md:max-w-[720px] lg:max-w-[612px] flex flex-col justify-center gap-4">
                
                <BubbleText />

                <div className='text-center text-xl text-gray-100 font-normal'>
                    {/** TODO: slot machine spiny animation to cycle through flavorTexts array */}
                    {flavorTexts[0].split(' ').map((word, index) => {
                        if (FLAVOR_KEY_WORDS.includes(word.toLowerCase())) {
                            return <span key={index} className="font-bold bg-grad text-indigo-500">{word} </span>
                        } else {
                            return <span key={index}>{word} </span>
                        }})
                    }
                </div>

                {/* error message and search input */}
                <p className="flex justify-center text-white">{errorMessage}</p>
                <div className="relative flex items-center">
                    <input onChange={(event) => setQuery(event.target.value)} className="w-full bg-[#331E84] px-4 py-3 text-left text-lg font-normal leading-none text-gray-200 placeholder-gray-200 outline-none rounded-none" type="text" placeholder="enter an email, username, phone, ip & more..."></input>
                    <button className="cursor-pointer bg-transparent text-white h-full w-24" onClick={handleSearch}>search</button>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {buttonCategories.map((button, index) => (
                        <button key={index} onClick={() => handleButtonChange(button)} className={`p-2 rounded w-32 text-white cursor-pointer bg-[#5D3FD3] ${selectedButton === button ? 'bg-indigo-500' : ''}`}>{button}</button>
                    ))}
                </div>

                {/* results are downloaded once set */}
                {loading && <p className="text-white text-center">loading...</p>}
                {results.length > 0 && <div className="flex flex-col gap-4">

                </div>}


            </div>

            <Footer />

        </div>
    )
}
