"use client"
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { v4 as uuidv4 } from 'uuid';

interface FormValues {
  eventName: string;
  eventType: string;
  price: string;
  description: string;
  publicAddress: string;
  expiry: string;
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


  if (!values.price) {
    errors.price = 'Required';
  } else if (isNaN(Number(values.price))) {
    errors.price = 'Must be a number';
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


  const formik = useFormik<FormValues>({
    initialValues: {
      eventName: '',
      eventType: '',
      price: '',
      description: '',
      expiry: '',
      publicAddress: ''
    },
    validate,
    onSubmit: async(values) => {

      const formData={
          ...values,
          actionId:uuidv4()
      }
      console.log(uuidv4())
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      console.log(data);
      setEvents(data.events);
    },
  });



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    formik.handleSubmit(e); // Manually handle form submission with Formik
  };


  return (
    <form onSubmit={handleSubmit}>
      

        <div>
        <label htmlFor="eventName">Event Name</label>
      <input
        id="eventName"
        name="eventName"
        type="text"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.eventName}
      />
      {formik.touched.eventName && formik.errors.eventName ? (
        <div>{formik.errors.eventName}</div>
      ) : null}
        </div>
      


        <div>
        <label htmlFor="eventType">Event Type</label>
      <input
        id="eventType"
        name="eventType"
        type="text"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.eventType}
      />
      {formik.touched.eventType && formik.errors.eventType ? (
        <div>{formik.errors.eventType}</div>
      ) : null}

        </div>



        <div>
        <label htmlFor="publicAddress">Your wallet address</label>
      <input
        id="publicAddress"
        name="publicAddress"
        type="text"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.publicAddress}
      />
      {formik.touched.publicAddress && formik.errors.publicAddress ? (
        <div>{formik.errors.publicAddress}</div>
      ) : null}

        </div>




      <div>
      <label htmlFor="price">Price</label>
      <input
        id="price"
        name="price"
        type="text"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.price}
      />
      {formik.touched.price && formik.errors.price ? (
        <div>{formik.errors.price}</div>
      ) : null}


      </div>

      
        <div>
        <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.description}
      />
      {formik.touched.description && formik.errors.description ? (
        <div>{formik.errors.description}</div>
      ) : null}
        </div>




        <div>
        <label htmlFor="expiry">Expiry</label>
      <input
        id="expiry"
        name="expiry"
        type="date"
        placeholder="YYYY-MM-DD"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.expiry}
      />
      {formik.touched.expiry && formik.errors.expiry ? (
        <div>{formik.errors.expiry}</div>
      ) : null}

        </div>






      <button type="submit">Submit</button>
    </form>
  );
};

export default SignupForm;
