'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent } from 'react';

export default function Search() {
const router = useRouter();
 const searchParams = useSearchParams();

 function handleSearch(e: FormEvent<HTMLFormElement>) {
 e.preventDefault();
 
 const formData = new FormData(e.currentTarget);
 const q = formData.get('q')?.toString().trim();
 
 if (!q) return;

 const url = `/search?q=${encodeURIComponent(q)}`;

 // Attempt the Next.js client-side router push first
 try {
 router.push(url);
 } catch (error) {
 // If router.push fails (as it is likely doing in Vercel production), force a hard browser navigation.
 console.error("Router push failed, performing native window redirect.", error);
 window.location.href = url;
 }
}

 return (
 <form
 onSubmit={handleSearch}
 className="w-max-[550px] relative w-full lg:w-80 xl:w-full"
 >
 <input
 key={searchParams?.get('q')}
 type="text"
 name="q"
 placeholder="Search for products..."
 autoComplete="off"
 defaultValue={searchParams?.get('q') || ''}
 className="text-md w-full rounded-lg border bg-white px-4 py-2 text-black placeholder:text-neutral-500 md:text-sm dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
 />
 <button
 type="submit"
 className="absolute right-0 top-0 mr-3 flex h-full items-center"
>
<MagnifyingGlassIcon className="h-4" />
</button>
 </form>
 );
}

export function SearchSkeleton() {
return (
<form className="w-max-[550px] relative w-full lg:w-80 xl:w-full">
 <input
 placeholder="Search for products..."
className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
/>
 <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
 <MagnifyingGlassIcon className="h-4" />
</div>
</form>
 );
}