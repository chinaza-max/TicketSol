import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import {
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";


import {
  PublicKey
} from "@solana/web3.js";


interface Event {
  actionId: string;
  eventType: string;
  price1: number;
  price2: number;
  package1: string;
  package2: string;
  description: string;
  eventName: string;
  expiry: string;
  imageURL: string;
  publicAddress: PublicKey;
}

const filePath = path.resolve(process.cwd(), 'src/app/api/actions/checkout', 'events.json');


const ensureDataFileExists = () => {
  const folderPath = path.dirname(filePath);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
};


export  const POST =async (req: Request) => {

    
    const { actionId,publicAddress, imageURL, eventName, eventType, price1, price2, package1, package2, description, expiry } =await req.json() ;
    ensureDataFileExists();


    try {
      if (publicAddress) {
       new PublicKey(publicAddress!);
      }

    } catch (err) {
      console.log(err)

      return new Response(JSON.stringify({ message: 'Invalid wallet address' }), {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }


      const currentDate = new Date();
      const expiryDate = new Date(expiry);

      if (expiryDate < currentDate) {
        return new Response(JSON.stringify({ message: 'Cant use past date' }), {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
      }
    

    const newEvent: Event = {
      actionId,
      eventType,
      price1,
      price2,
      package1,
      package2,
      description,
      eventName,
      expiry,
      imageURL,
      publicAddress
    };

    let events: Event[] = [];

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      events = JSON.parse(fileData);
    }

    events.push(newEvent);
    console.log(events)
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));

   // res.status(201).json({ message: 'Event added successfully', event: newEvent, events });
    const payload={ message: 'Event added successfully', blinkpreview: `https://dial.to/devnet?action=solana-action:http://localhost:3000/api/actions/checkout?uniqueAction=${actionId}` }

    
    return new Response(JSON.stringify(payload),{
      status: 200,
      headers: ACTIONS_CORS_HEADERS,
    })
  
};


/*
export const GET = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { eventType } = req.query;

    let events: Event[] = [];

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      events = JSON.parse(fileData);
    }

    const filteredEvents = events.filter(event => event.type === eventType);

    res.status(200).json(filteredEvents);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};*/
