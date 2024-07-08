"use client"
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { v4 as uuidv4 } from 'uuid';

interface FormValues {
  eventName: string;
  eventType: string;
  price1: string;
  price2: string;
  package1: string;
  package2: string;
  description: string;
  publicAddress: string;
  expiry: string;
  imageURL: string;
}

const validate = (values: FormValues): Partial<Record<keyof FormValues, string>> => {
  const errors: Partial<Record<keyof FormValues, string>> = {};

  if (!values.eventName) {
    errors.eventName = 'Required';
  }

  if (!values.eventType) {
    errors.eventType = 'Required';
  }

  if (!values.publicAddress) {
    errors.publicAddress = 'Required';
  }

  
  if (!values.imageURL) {
    errors.imageURL = 'Required';
  }


  

  if (!values.price1) {
    errors.price1 = 'Required';
  } else if (isNaN(Number(values.price1))) {
    errors.price1 = 'Must be a number';
  }

  if (!values.package1) {
    errors.description = 'Required';
  }

  if (!values.description) {
    errors.description = 'Required';
  }

  if (!values.expiry) {
    errors.expiry = 'Required';
  } else if (isNaN(Date.parse(values.expiry))) {
    errors.expiry = 'Invalid date format';
  }

  return errors;
};


const SignupForm: React.FC = () => {

  const [events, setEvents] = useState<Event[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);


  const formik = useFormik<FormValues>({
    initialValues: {
      eventName: '',
      eventType: '',
      price1: '',
      price2: '',
      package1: '',
      package2: '',
      description: '',
      expiry: '',
      publicAddress: '',
      imageURL: ''
    },
    validate,
    onSubmit: async(values) => {

      const formData={
          ...values,
          actionId:uuidv4()
      }
      
      
      try {
        setErrorMessage("")
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  


      if (!response.ok) {

        console.log(response)
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'An unknown error occurred');
        return;
      }

      const data = await response.json();
     // setEvents(data.events);
      setTicketUrl(data.blinkpreview)
      setErrorMessage('');

      } catch (error) {

        console.log(error)

        if (error instanceof Error) {
          console.log(error.message)

          setErrorMessage(error.message);
        } else {
          setErrorMessage('An unknown error occurred');
        }
      }

    },
  });



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    formik.handleSubmit(e); // Manually handle form submission with Formik
  };

  const handleViewTicket = () => {
    console.log(ticketUrl)
    if (ticketUrl) {
      window.open(ticketUrl, '_blank'); // Open ticketUrl in a new tab
    }
  };

  useEffect(() => {
    
  
  
  }, [errorMessage])
  


  return (

    <div style={{border:"1px solid blue"}} className="grid justify-items-center  min-h-screen  flex-col">
     
      <form onSubmit={handleSubmit}  className='max-w-4xl grid gap-3 mb-6 md:grid-cols-2 py-4 p-10 mt-28 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700'  >
        
      <div>
          <label htmlFor="eventType" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Event Type</label>
    
        <select
              id="eventType"
              name="eventType"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.eventType}
              className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected>Choose a country</option>
            <option value="Concerts">Concerts and Music Festivals</option>
            <option value="Sports">Sports Events</option>
            <option value="Conferences">Conferences and Conventions</option>
            <option value="Amusement">Amusement Parks and Attractions</option>
          </select>



        {formik.touched.eventType && formik.errors.eventType ? (
          <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.eventType}</div>
        ) : null}

          </div>




          <div>
            <label htmlFor="eventName" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Event Name</label>
            <input
              id="eventName"
              name="eventName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.eventName}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            />
            {formik.touched.eventName && formik.errors.eventName ? (
              <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.eventName}</div>
            ) : null}
          </div>

          <div>
          <label htmlFor="publicAddress" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Your wallet address</label>
        <input
          id="publicAddress"
          name="publicAddress"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.publicAddress}

          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        />
        {formik.touched.publicAddress && formik.errors.publicAddress ? (
          <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.publicAddress}</div>
        ) : null}

          </div>



          <div>
          <label htmlFor="expiry" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Expiry</label>
        <input
          id="expiry"
          name="expiry"
          type="date"
          placeholder="YYYY-MM-DD"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.expiry}
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        />
        {formik.touched.expiry && formik.errors.expiry ? (
          <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.expiry}</div>
        ) : null}

          </div>

        <a href="#" className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

        <div>
        <label htmlFor="package1" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Package1   - <span className='text-xs'>Required</span></label>
        <input
          id="package1"
          name="package1"
          type="package1"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.package1}
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        />
        {formik.touched.package1 && formik.errors.package1 ? (
          <div className='mt-2 text-sm text-red-600 dark:text-red-500'>{formik.errors.package1}</div>
        ) : null}
        </div>

        <div>
        <label htmlFor="price1" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Price in sol</label>
        <input
          id="price1"
          name="price1"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.price1}
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        />
        {formik.touched.price1 && formik.errors.price1 ? (
          <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.price1}</div>
        ) : null}
        </div>
        </a>

        <a href="#" className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">

          <div>
          <label htmlFor="package2" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Package2  - <span className='text-xs'>Optional</span></label>
          <input
            id="package2"
            name="package2"
            type="package2"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.package2}
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
          />
          {formik.touched.package2 && formik.errors.package2 ? (
            <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.package1}</div>
          ) : null}
          </div>

          <div>
          <label htmlFor="price1" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Price in sol</label>
          <input
            id="price2"
            name="price2"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.price2}
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
          />
          {formik.touched.price2 && formik.errors.price2 ? (
            <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.price2}</div>
          ) : null}
          </div>

        </a>





        
          <div>
          <label htmlFor="description" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Description</label>
        <textarea
          id="description"
          name="description"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.description}
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        />
        {formik.touched.description && formik.errors.description ? (
          <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.description}</div>
        ) : null}
          </div>



          <div>
            <label htmlFor="imageURL" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Event Image URL</label>
            <input
              id="imageURL"
              name="imageURL"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.imageURL}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            />
            {formik.touched.imageURL && formik.errors.imageURL ? (
              <div className='mt-1 text-sm text-red-600 dark:text-red-500'>{formik.errors.imageURL}</div>
            ) : null}
          </div>

        
          <div>
            <span className='text-xs'>After filling the field you create action and then view ticket </span>
            <button type="button"  onClick={handleViewTicket} className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  block  px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 h-14 w-full  ${ticketUrl ? '' : 'opacity-50 cursor-not-allowed'}`} >View Ticket</button>
          </div>

          <div>
          <span className='text-xs'>Create your blink action </span>
            <button type="submit" className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  block  px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 h-14 w-full'>Submit</button>
          </div>
          <div style={{color:"red"}} className='text-center'>     
         {errorMessage}
      </div>
      </form>
     </div>
      
  );
};

export default SignupForm;
