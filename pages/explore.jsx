import {ethers} from 'ethers';
import { useState,useContext, useEffect} from 'react';

import {useRouter} from 'next/router';

import axios from 'axios';

import { MetamaskContext } from '../context/MetamaskContext';

import Footer from '../components/Footer/Footer';
import Loader from '../components/Loader';

import { BuyNFT } from '../components/Cards/NFT';



export default function User() {

  const {account, nftContract, sftContract, marketplaceContract} = useContext(MetamaskContext);
  
  const [loading, setLoading] = useState(false);
  
  const [listedNfts, setListedNfts] = useState([]);  

  const router = useRouter();


  useEffect(() => {

    loadListedNfts();
   },[])
   


 async function loadListedNfts(){

  try {
    setLoading(true);

    let data = await marketplaceContract.fetchListedNFTs();

    const items = await Promise.all(data.map( async i => {

      const uri = await nftContract.tokenURI(i.tokenId);


      const metadata = await axios.get(uri);

      const _price = ethers.utils.formatEther(i.price).toString().slice(0,4);

      let item = {
        id: i.tokenId.toNumber(),
        market: i.NFT_MarketItemId.toNumber(), 
        price: _price,
        name: metadata.data.name,
        image: metadata.data.image,
        type: metadata.data.type,
        seller: i.seller
      }

      return item;

    }));
    

    setListedNfts(prev => items);
    setLoading(false);



  }
  catch(e){
    setLoading(false);
    console.log(e);
  }


 } 


  return (
    <>
     <div className="h-screen gradient-bg-sec">
       { loading || !listedNfts.length? 
            (<div className='flex w-full h-full items-center justify-center'>
            <Loader/> 
            </div>):
            
            (<div className="flex justify-center">
              <div className="p-4" style={{ maxWidth: '1600px' }}>
               
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                  {
                    listedNfts.map((nft, i) => (
                      <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <BuyNFT uri={nft.image} id={nft.id} name={nft.name} price={nft.price} seller={nft.seller} market={nft.market}/>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            )
            }
        
     </div>

    <Footer account={account}/>
    </>
  )  
}
