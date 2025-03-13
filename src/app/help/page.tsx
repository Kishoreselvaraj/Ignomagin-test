import Footer from '@/src/components/Footer'
import NavBar from '@/src/components/NavBar'
import React from 'react'

function page() {
  return (
    <div>
        <NavBar/>
        <div className="flex justify-center items-center h-screen"></div>
        <Footer/>   
    </div>
  )
}

export default page