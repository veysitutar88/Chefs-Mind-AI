'use client' 

import { useState, useEffect } from 'react'
import { ChefHat, Calculator, Brain, Send, Loader2, Activity, Camera, Search, CheckCircle } from 'lucide-react'
import GoogleConnect from '../../components/GoogleConnect'

function Page() {
  return (
    <div>
      <GoogleConnect />
    </div>
  )
}

export default Page