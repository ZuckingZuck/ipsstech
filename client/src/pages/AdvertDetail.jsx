import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import axios from 'axios'
const AdvertDetail = () => {
    const {id} = useParams();
    const [advert, setAdvert] = useState({});
    const fetchAdvert = async () => {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/advert/${id}`);
        if(response.status === 200){
            setAdvert(response.data);
        }
    }

    useEffect(() => {
        fetchAdvert();
    }, [])
  return (
    <div className='bg-gray-800 text-white'>
        <div className='container mx-auto py-10'>
            <div>
                <h1 className='text-2xl font-bold'>{advert.title}</h1>
                <p className='mb-2'>Takım: {advert.teamId.name}</p>
                <p>
                    {
                        advert.fields.map((field) => {
                            return <span className='bg-gray-500 mr-2 rounded cursor-pointer'>#{field}</span>
                        })
                    }
                </p>
                <p>
                    {
                        advert.skills.map((skill) => {
                            return <span className='bg-gray-500 mr-2 rounded cursor-pointer'>#{skill}</span>
                        })
                    }
                </p>
                <p className='mt-2'>{advert.description}</p>
                <p>Takım Lideri: {advert.owner.name} {advert.owner.surname}</p>
            </div>
        </div>
        
    </div>
  )
}

export default AdvertDetail