"use client"

import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import EmojiPicker from 'emoji-picker-react'
import { addBudget, getBudgetByUser } from '../actions'
import NotificationModal from '../components/NotificationModal'
import { Budget } from '@/type'
import Link from "next/link";
import BudgetItem from '../components/BudgetItem'

const page = () => {
    
    const {user} = useUser()
    const [budgetName, setBudgetName] = useState<string>("")
    const [budgetAmount, setBudgetAmount] = useState<string>("")
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)
    const [selectedEmoji, setSelectedEmoji] = useState<string>("")

    const [budgets, setBudgets] = useState<Budget[]>([])

    const [notification, setNotification] = useState<string>("")
    const closeNotification = () => {
        setNotification("")
    }

    const handleEmojiSelect = (emojiObject : {emoji: string}) => {
        setSelectedEmoji(emojiObject.emoji)
        setShowEmojiPicker(false)
    }

    const handleAddBudget = async () => {
        try {
            const amount = parseFloat(budgetAmount)
            if(isNaN(amount) || amount <= 0){
                throw new Error("Le montant doit être un nombre positif.")
            }

            await addBudget(user?.primaryEmailAddress?.emailAddress as string,
                budgetName,
                amount,
                selectedEmoji
            )

            fetchBudgets()

            const modal = document.getElementById("my_modal_3") as HTMLDialogElement

            if(modal){
                modal.close()
            }

            setNotification("Nouveau budget créer avec succès !")
            setBudgetName("")
            setBudgetAmount("")
            setSelectedEmoji("")
            setShowEmojiPicker(false)

        } catch (error) {
            setNotification(`${error}`)
        }
    }

    const fetchBudgets = async () => {
        if(user?.primaryEmailAddress?.emailAddress){
            try {
                const userBudgets = await getBudgetByUser(user?.primaryEmailAddress?.emailAddress)

                setBudgets(userBudgets)
                
            } catch (error) {
                setNotification(`Erreur lors de la récupération des budgets: ${error}`)
            }
        }
    }

    useEffect(() => {
        fetchBudgets()
        
    }, [user?.primaryEmailAddress?.emailAddress])

    return (
        <Wrapper>
            {notification && (
                <NotificationModal message={notification} onclose={closeNotification}></NotificationModal>
            )}

            <button className="btn mb-4" onClick={()=> (document.getElementById('my_modal_3') as HTMLDialogElement).showModal()}>Nouveau budget</button>
            <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
                <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg">Création d'un budget</h3>
                <p className="py-4">Permet de gérer ses dépenses facilement</p>
                <div className='w-full flex flex-col'>
                    <input type="text" 
                        value={budgetName} 
                        placeholder='Nom du budget' 
                        onChange={(e) => setBudgetName(e.target.value)} 
                        className='input input-bordere mb-3'
                        required/>
                    <input type="number" 
                        value={budgetAmount} 
                        placeholder='Montant du budget' 
                        onChange={(e) => setBudgetAmount(e.target.value)} 
                        className='input input-bordere mb-3'
                        required/>

                    <button className='btn mb-3' onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    {selectedEmoji || "Séléctionnez un emoji "}
                    </button>

                    { showEmojiPicker && (
                        <div className='flex justify-center items-center my-4'>
                            <EmojiPicker onEmojiClick={handleEmojiSelect}/>
                        </div>
                    )}

                    <button onClick={handleAddBudget} className='btn btn-accent'>
                        Ajouter budget
                    </button>
                </div>
            </div>
            </dialog>

            <ul className='grid md:grid-cols-3 gap-4'>
                {budgets.map((budget) => (
                    <Link href={"/e"} key={budget.id}>
                        <BudgetItem budget={budget} enableHover={1}/>
                    </Link>
                ))}
            </ul>
        </Wrapper>
    )
}

export default page