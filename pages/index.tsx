import Head from 'next/head'
import Image from 'next/image'
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'
import {
  InstantSearch,
  Index,
  Hits,
  Highlight,
  connectSearchBox,
  connectStateResults,
  // SearchBox
} from 'react-instantsearch-dom'
import { Command } from 'cmdk'
import { useEffect, useState } from 'react'

const typesenseInstantSearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: process.env.NEXT_PUBLIC_API_KEY!, // Be sure to use the search-only-api-key
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_HOST!,
        port: parseInt(process.env.NEXT_PUBLIC_PORT!),
        protocol: process.env.NEXT_PUBLIC_PROTOCOL!,
      },
    ],
  },
  additionalSearchParameters: {
    query_by: 'name',
    num_typos: 1,
  },
  // collectionSpecificSearchParameters: {
  //   apps: {
  //     query_by: 'name',
  //     num_typos: 2,
  //   },
  // }
})

const searchClient = {
  ...typesenseInstantSearchAdapter.searchClient,
  search(requests: any[]) {
    if (requests.every(({ params }) => !params.query)) {
      return Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          nbHits: 0,
          nbPages: 0,
          page: 0,
          processingTimeMS: 0,
          hitsPerPage: 0,
          exhaustiveNbHits: false,
          query: '',
          params: '',
        })),
      })
    }

    return typesenseInstantSearchAdapter.searchClient.search(requests)
  },
}

export const Hit = ({ hit }: { hit: any }) => {
  return (
    <div className='flex mb-2'>
      <div className='w-1/3'>
        <img src={hit.logo} alt='logo' />
      </div>
      <div className='w-2/3 text-black'>
        <Highlight attribute='name' hit={hit} tagName='strong' />
        <p>{hit.description}</p>
      </div>
    </div>
  )
}

export const CustomSearchBox = connectSearchBox(
  ({ currentRefinement, refine }: { currentRefinement: any; refine: any }) => {
    const [open, setOpen] = useState(false)

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
      const down = (e: { key: string; metaKey: any }) => {
        if (e.key === 'k' && e.metaKey) {
          setOpen((open) => !open)
        }
      }

      document.addEventListener('keydown', down)
      return () => document.removeEventListener('keydown', down)
    }, [])

    return (
      <div className='mt-2 mb-2'>
        <Command
          value={currentRefinement}
          onChange={(e) => {
            const target = e.target as HTMLInputElement
            refine(target.value)
          }}
          filter={(value, search) => {
            console.log(value)
            console.log(search)
            if (value.includes('swap')) return 1
            return 0
          }}
        >
          <Command.Input
            placeholder='Search for apps and commands...'
            className='p-4 bg-white w-[650px] rounded-t-md border-b border-gray-400'
          />
          <Command.List className='bg-white rounded-b-md p-2'>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group
              heading='Suggestions'
              className='text-xs text-gray-400'
            >
              <Command.Item
                onSelect={(value) => console.log('Selected', value)}
                className='text-black text-base cursor-pointer hover:bg-gray-100 hover:rounded-md px-2 py-1 mt-2'
              >
                Swap
              </Command.Item>
              <Command.Item
                onSelect={(value) => console.log('Selected', value)}
                className='text-black text-base  cursor-pointer hover:bg-gray-100 hover:rounded-md px-2 py-1'
              >
                shain.eth
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          label='Global Command Menu'
          className='fixed top-[25%] left-[28%] w-[650px] h-[500px] bg-white'
        >
          <Command
            value={currentRefinement}
            onChange={(e) => {
              const target = e.target as HTMLInputElement
              refine(target.value)
            }}
          >
            <Command.Input
              placeholder='Search for apps and commands...'
              className='p-4 bg-white w-[650px] rounded-t-md border-b border-gray-400'
            />
            <Command.List className='bg-white rounded-b-md p-2'>
              <Command.Empty>No results found.</Command.Empty>
              <Command.Group
                heading='Suggestions'
                className='text-xs text-gray-400'
              >
                <Command.Item
                  onSelect={(value) => console.log('Selected', value)}
                  className='text-black text-lg cursor-pointer hover:bg-gray-100 hover:rounded-md p-2'
                >
                  Swap
                </Command.Item>
                <Command.Item
                  onSelect={(value) => console.log('Selected', value)}
                  className='text-black text-lg cursor-pointer hover:bg-gray-100 hover:rounded-md p-2'
                >
                  shain.eth
                </Command.Item>
              </Command.Group>{' '}
            </Command.List>
          </Command>
        </Command.Dialog>
      </div>
    )
  }
)

export const IndexResults = connectStateResults(
  ({
    searchState,
    searchResults,
    children,
  }: {
    searchState: any
    searchResults: any
    children: any
  }) => {
    console.log(searchResults)
    return searchResults && searchResults.nbHits !== 0 ? (
      children
    ) : (
      <div>
        No results have been found for {searchState.query} in index{' '}
        {searchResults ? searchResults.index : ''}
      </div>
    )
  }
)

export const AllResults = connectStateResults(
  ({
    searchState,
    allSearchResults,
    children,
  }: {
    searchState: any
    allSearchResults: any
    children: any
  }) => {
    if (searchState && searchState.query) {
      const hasResults =
        allSearchResults &&
        Object.values(allSearchResults).some(
          (results: any) => results.nbHits > 0
        )
      return !hasResults ? (
        <div>
          <div>No results</div>
          <Index indexName='apps' />
          <Index indexName='DAOs' />
        </div>
      ) : (
        children
      )
    }
  }
)

// const Results = connectStateResults(
//   ({ searchState, children }: { searchState: any; children: any }) =>
//     searchState && searchState.query ? children : <div>No query</div>
// )

export default function Home() {
  return (
    <div className='bg-blue-50'>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='flex flex-col items-center'>
        <InstantSearch indexName='apps' searchClient={searchClient}>
          <CustomSearchBox />
          {/* <Results> */}
          <AllResults>
            <Index indexName='apps'>
              {/* <IndexResults> */}
              {/* <h2 className='mt-2'>index: apps</h2> */}
              <Hits hitComponent={Hit} />
              {/* </IndexResults> */}
            </Index>
            <Index indexName='DAOs'>
              {/* <IndexResults> */}
              {/* <h2 className='mt-2'>index: DAOs</h2> */}
              <Hits hitComponent={Hit} />
              {/* </IndexResults> */}
            </Index>
          </AllResults>
          {/* </Results> */}
        </InstantSearch>
      </main>

      {/* <footer className={styles.footer}>
        <a
          href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
          </span>
        </a>
      </footer> */}
    </div>
  )
}
