'use client'

import React, { useState } from 'react'
import { IoIosSunny } from 'react-icons/io'
import { MdLocationOn, MdMyLocation } from 'react-icons/md'
import SearchBox from './SearchBox'
import axios from 'axios'
import { useAtom } from 'jotai'
import { loadingCityAtom, placeAtom } from '@/app/atom'

type Props = { location?: string }

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY;

export default function Navbar({ location }: Props) {
    const [city, setCity] = useState("");
    const [error, setError] = useState("");

    const [suggestion, setSuggestion] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [place, setPlace] = useAtom(placeAtom);
    const [_, setLoadingCity] = useAtom(loadingCityAtom);

    async function handleInputChange(value: string) {
        setCity(value);
        if (value.length >= 3) {
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`);
                const suggestions = response.data.list.map((item: any) => item.name);
                setSuggestion(suggestions);
                setError('');
                setShowSuggestions(true);
            } catch (error) {
                setSuggestion([])
                setShowSuggestions(false);
                console.log("There is some error fetching the cities", error);
            }
        } else {
            setSuggestion([])
            setShowSuggestions(false);
        }
    }

    function handleSuggestionClick(value: string) {
        setCity(value);
        setShowSuggestions(false);
    }

    function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
        setLoadingCity(true);
        e.preventDefault();
        if (suggestion.length == 0) {
            setError("Location not found");
            setLoadingCity(false);
        } else {
            setError('');
            setTimeout(() => {
                setLoadingCity(false);
                setPlace(city);
                setShowSuggestions(false);
            }, 500);

        }
    }

    function handleCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (postiion) => {
                const { latitude, longitude } = postiion.coords;
                try {
                    setLoadingCity(true);
                    const response = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
                    );
                    setTimeout(() => {
                        setLoadingCity(false);
                        setPlace(response.data.name);
                    }, 500);
                } catch (error) {
                    setCity('');
                    setSuggestion([])
                    setShowSuggestions(false);
                    setLoadingCity(false);
                }
            });
        }
    }

    return (
        <>
            <nav className='shadow-sm sticky top-0 lef-0 bg-white'>
                <div className="flex w-full justify-between items-center max-w-7xl px-3 h-[80px] mx-auto">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-gray-500 text-3xl">Weather</h2>
                        <IoIosSunny className='text-3xl mt-1 text-yellow-300' />
                    </div>
                    <section className="flex gap-2 items-center">
                        <MdMyLocation
                            title="Your current location"
                            onClick={handleCurrentLocation}
                            className='text-2xl text-gray-400 hover:opacity-80 cursor-pointer' />
                        <MdLocationOn className='text-3xl' />
                        <p className="text-slate-900/80 text-sm">{location}</p>
                        <div className='relative hidden md:flex' >
                            <SearchBox value={city}
                                onSubmit={handleSubmitSearch}
                                onChange={(e) => handleInputChange(e.target.value)}
                            />
                            <SuggetionBox
                                {...{
                                    showSuggestions, suggestion, handleSuggestionClick, error
                                }} />
                        </div>
                    </section>
                </div>
            </nav>

            <section className="flex max-w-7xl px-3 md:hidden">
                <div className='relative' >
                    <SearchBox value={city}
                        onSubmit={handleSubmitSearch}
                        onChange={(e) => handleInputChange(e.target.value)}
                    />
                    <SuggetionBox
                        {...{
                            showSuggestions, suggestion, handleSuggestionClick, error
                        }} />
                </div>
            </section>
        </>
    )
}

function SuggetionBox({
    showSuggestions,
    suggestion,
    handleSuggestionClick,
    error
}: {
    showSuggestions: boolean;
    suggestion: string[];
    handleSuggestionClick: (item: string) => void;
    error: string;
}) {
    return (
        <>
            {((showSuggestions && suggestion.length >= 1) || error) && (
                <ul className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px]  flex flex-col gap-1 py-2 px-2">
                    {error && suggestion.length < 1 && (
                        <li className="text-red-500 p-1 "> {error}</li>
                    )}
                    {suggestion.map((item, i) => (
                        <li
                            key={i}
                            onClick={() => handleSuggestionClick(item)}
                            className="cursor-pointer p-1 rounded   hover:bg-gray-200"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}