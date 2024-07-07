import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import * as web3 from "@solana/web3.js"
import * as fs from "fs"
import path from 'path';

import {
  Metaplex,
  keypairIdentity,
  irysStorage,
  toMetaplexFile,
  NftWithToken,
  Nft
} from "@metaplex-foundation/js"

import {
  Authorized,
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  Keypair,  
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { DEFAULT_SOL_ADDRESS, DEFAULT_SOL_AMOUNT } from "./const";

interface NftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
}


const filePath = path.resolve(process.cwd(), 'src/app/api/actions/checkout', 'events.json');

interface Event {
  actionId: string;
  type: string;
  price: number;
  description: string;
  name: string;
  expiry: string;
  publicAddress:PublicKey;
}

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
   // const { toPubkey } = validatedQueryParams(requestUrl);

    console.log(requestUrl.searchParams.get("uniqueAction"))
    const actionIdToFind=requestUrl.searchParams.get("uniqueAction")
    let events: Event[] = [];

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      events = JSON.parse(fileData);
    }
    
    const matchingObject = events.find(item => item.actionId === actionIdToFind);


    if (!matchingObject) {
      let message = "could not retrieve any event action";
      return new Response(message, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });    
    }
    const toPubkey=new PublicKey(matchingObject.publicAddress)

    const baseHref = new URL(
      `/api/actions/checkout?to=${toPubkey.toBase58()}&uniqueAction=${actionIdToFind}`,
      requestUrl.origin
    ).toString();
    

    const payload: ActionGetResponse = {
      title: "Lap top",
      icon:  matchingObject.ImageURL /*new URL("/download.png", requestUrl.origin).toString()*/,
      description: "PRICE - $148.01(1sol);   QUANTITY - 1  ",
      label: "Transfer", // this value will be ignored since `links.actions` exists
      links: {
        actions: [
          {
            label: "Pay with SOL", // button text
            href: `${baseHref}&amount=${"1"}`,
            parameters: [
             
              {
                name: "alternativeContact",
                label: "Alternative Contact",
                required: true,
              },
              {
                name: "deliveryAddress",
                label: "Address for Delivery",
                required: true,
              }
            ]
          }
          
        ],
      },
    };

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS
    });

  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { amount, toPubkey } = validatedQueryParams(requestUrl);
    const body: ActionPostRequest  & {
      alternativeContact: string;
      deliveryAddress: string;
    } = await req.json();

    // validate the client provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {

      console.log(err)
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const connection = new Connection(clusterApiUrl('devnet'));

    // initialize a keypair for the user
    const user = await initializeKeypair(connection);

    /*
    // ensure the receiving account will be rent exempt
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0 // note: simple accounts that just store native SOL have `0` bytes of data
    );


    if (amount * LAMPORTS_PER_SOL < minimumBalance) {
      throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
    }*/

    const transaction = new Transaction();

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // set the end user as the fee payer
    transaction.feePayer = account;

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

   /* transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      })
      .toString("base64");*/

   



    const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      irysStorage({
        address: "https://devnet.irys.xyz",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    );
    

    const nftData = {
      name: "Laptop Purchase Receipt",
      symbol: "LPR",
      description: `Receipt for Laptop Purchase\nPrice: $148.01 USD\nQuantity: 1\nAlternative Contact: ${body.alternativeContact}\nDelivery Address: ${body.deliveryAddress}`,
      sellerFeeBasisPoints: 0,
      imageFile: "download.png",
    };

    const uri = await uploadMetadata(metaplex, nftData)
    const nft = await createNft(metaplex, uri, nftData, account)
    //const receiptUrl = `https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`;

    console.log(body)
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Your purchase was successful! View your receipt as NFT in your wallet.`,
      },
    });
/*
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Your purchase was successful! View your receipt NFT [here]}).`,
      },
    });*/

    return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {

    console.log(err);

    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = DEFAULT_SOL_ADDRESS;
  let amount:number= DEFAULT_SOL_AMOUNT;

  try {
    if (requestUrl.searchParams.get("to")) {
      toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
    }
  } catch (err) {
    console.log(err)
    throw "Invalid input query parameter: to";
  }

  try {
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount")!);
    }

  } catch (err) {
    console.log(err)
    throw "Invalid input query parameter: amount";
  }

  return {
    amount,
    toPubkey,
  };
}







/*

async function uploadMetadata(
  metaplex: Metaplex,
  nftData: NftData,
): Promise<string> {
  // file to buffer
  const buffer = fs.readFileSync("src/" + nftData.imageFile);

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, nftData.imageFile);

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
 // console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  console.log("metadata uri:", uri);
  return uri;
}
*/



async function initializeKeypair(
  connection: web3.Connection
): Promise<web3.Keypair> {
  if (!process.env.PRIVATE_KEY) {
    console.log("Creating .env file")
    const signer = web3.Keypair.generate()
    fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`)
    await airdropSolIfNeeded(signer, connection)

    return signer
  }

  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
  const secretKey = Uint8Array.from(secret)
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
 // await airdropSolIfNeeded(keypairFromSecretKey, connection)
  return keypairFromSecretKey
}

async function airdropSolIfNeeded(
  signer: web3.Keypair,
  connection: web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey)
  console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL)

  if (balance < web3.LAMPORTS_PER_SOL) {
    console.log("Airdropping 5 SOL...")

    console.log( signer.publicKey.toString())

    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      web3.LAMPORTS_PER_SOL*5
    )

    const latestBlockHash = await connection.getLatestBlockhash()

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    })

    const newBalance = await connection.getBalance(signer.publicKey)
    console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL)
  }
}



async function createNft(
  metaplex: Metaplex,
  uri: string,
  nftData: NftData,
  ownerPublicKey: PublicKey,
): Promise<Nft> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri, // metadata URI
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
      tokenOwner:ownerPublicKey
    },
    { commitment: "finalized" },
  );

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  return nft;

}


async function uploadMetadata(
  metaplex: Metaplex,
  nftData: NftData,
): Promise<string> {
  // file to buffer
  const buffer = fs.readFileSync("public/" + nftData.imageFile);

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, nftData.imageFile);

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  console.log("metadata uri:", uri);
  return uri;
}
