import React from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router';
const Adverts = () => {
    const adverts = useSelector(state => state.advert.adverts);
  return (
    <div className='bg-gray-600'>
        <div className='container mx-auto justify-center py-3 text-white'>
            <div className='text-2xl font-bold text-center'>
                Takım Arkadaşı İlanları
            </div>
            <div id='adverts'>
                {
                    adverts?.map((advert) => {
                        return (
                            <div key={advert._id} className='my-5 border-b bg-blue-700 rounded p-4'>
                                <h1 className='text-lg font-bold'>{advert.title}</h1>
                                <p>
                                    {advert?.fields?.map((field => {
                                        return <span className='mr-2 bg-gray-500 rounded cursor-pointer'>#{field}</span>
                                    }))}
                                </p>
                                <p>Takım: {advert.teamId.name}</p>
                                <p>{advert.description}</p>
                                <p className='mb-2'>Takım Lideri: {advert.owner.name} {advert.owner.surname}</p>
                                <NavLink className={"bg-gray-800 py-1 px-2 rounded hover:bg-gray-700 transition"} to={`/advert/${advert._id}`}>Detaylı incele</NavLink>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    </div>
  )
}

export default Adverts