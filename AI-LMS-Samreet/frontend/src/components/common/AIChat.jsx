import React, { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai"
import { FaRobot } from "react-icons/fa"
import { apiConnector } from "../../services/apiconnector"
import { AI_CHAT_API } from "../../services/apis"
import { toggleChat, closeChat } from "../../slices/chatSlice"

const AIChat = () => {
  const dispatch = useDispatch()
  const isOpen = useSelector((state) => state.chat.isOpen)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to EduAI, your personal AI-Based LMS Tutor. How can I help you with your studies today?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Please login first to use the AI Tutor.",
        },
      ])
      setLoading(false)
      return
    }

    try {
      const response = await apiConnector(
        "POST",
        AI_CHAT_API,
        { message: input, history: messages },
        { Authorization: `Bearer ${token}` }
      )

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.data.reply },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, kuch problem aa gayi. Dobara try karo!",
          },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Server se connect nahi ho pa raha. Thodi der baad try karo.",
        },
      ])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => dispatch(toggleChat())}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-richblack-900 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-yellow-300 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        title="AI Tutor"
      >
        {isOpen ? (
          <AiOutlineClose size={24} />
        ) : (
          <FaRobot size={24} />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-20 z-50 flex h-[min(520px,calc(100vh-6rem))] flex-col overflow-hidden rounded-2xl border border-richblack-600 bg-richblack-800 shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[500px] sm:w-[350px]">
          
          {/* Header */}
          <div className="flex items-center gap-3 bg-richblack-700 px-4 py-3 border-b border-richblack-600">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-richblack-900">
              <FaRobot size={18} />
            </div>
            <div>
              <p className="font-semibold text-richblack-5 text-sm">EduAI Tutor</p>
              <p className="text-xs text-green-400">● Online — 24/7 Available</p>
            </div>
            <button
              onClick={() => dispatch(closeChat())}
              className="ml-auto text-richblack-300 hover:text-richblack-5"
            >
              <AiOutlineClose size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-yellow-400 text-richblack-900 rounded-tr-sm"
                      : "bg-richblack-700 text-richblack-100 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-richblack-700 rounded-2xl rounded-tl-sm px-4 py-2">
                  <div className="flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-richblack-300 animate-bounce [animation-delay:0ms]"></span>
                    <span className="h-2 w-2 rounded-full bg-richblack-300 animate-bounce [animation-delay:150ms]"></span>
                    <span className="h-2 w-2 rounded-full bg-richblack-300 animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-richblack-600 bg-richblack-700 px-3 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Koi bhi question poochho..."
              rows={1}
              className="flex-1 resize-none rounded-xl bg-richblack-600 px-3 py-2 text-sm text-richblack-5 placeholder-richblack-400 outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-richblack-900 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <AiOutlineSend size={18} />
            </button>
          </div>

          {/* Footer */}
          <div className="bg-richblack-800 py-1 text-center">
            <p className="text-xs text-richblack-400">
              Powered by <span className="text-yellow-400">EduAI</span> — NLP Virtual Tutor
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default AIChat
