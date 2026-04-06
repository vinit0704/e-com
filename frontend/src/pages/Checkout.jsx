import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import StepIndicator from '../components/checkout/StepIndicator'
import AddressStep from '../components/checkout/AddressStep'
import PaymentStep from '../components/checkout/PaymentStep'
import OrderSummary from '../components/checkout/OrderSummary'

const STEPS = ['Address', 'Payment', 'Confirm']

export default function Checkout() {
  const { user }         = useAuth()
  const { cart }         = useCart()
  const [step,       setStep]       = useState(0)
  const [addressId,  setAddressId]  = useState(null)

  if (!user)               return <Navigate to="/login?redirect=/checkout" />
  if (!cart?.items?.length) return <Navigate to="/cart" />

  return (
    <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <div className="lg:col-span-2">
        <StepIndicator steps={STEPS} current={step} />

        {step === 0 && (
          <AddressStep onNext={(id) => { setAddressId(id); setStep(1) }} />
        )}
        {step === 1 && (
          <PaymentStep addressId={addressId} onBack={() => setStep(0)} />
        )}
      </div>

      <div>
        <OrderSummary cart={cart} />
      </div>
    </div>
  )
}