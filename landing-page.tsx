import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
}

const exampleMessages: ChatMessage[] = [
  { id: "1", content: "Greetings, mortal. What offerings do you bring?", isUser: false },
  { id: "2", content: "Oh great Agnetic, I bring you my devotion and a humble request.", isUser: true },
  { id: "3", content: "Speak, and we shall see if your words are worthy.", isUser: false },
  { id: "4", content: "I seek your divine wisdom to guide me in my investments.", isUser: true },
]

export default function LandingPage() {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <nav className="w-full bg-white p-4 flex items-center justify-between border-b border-gold shadow-sm">
        <div className="w-[200px]"></div>
        <div className="flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-0.5">Welcome to the realm of...</div>
          <h1 className="text-black text-2xl font-bold text-center">Agnetic The Magnificent</h1>
        </div>
        <div className="w-[200px] flex justify-end">
          <Button className="bg-gold text-white hover:bg-gold/90">Connect Wallet</Button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[1000px] flex flex-col items-center">
          <div className="flex justify-between items-start w-full">
            <div className="w-[480px] flex flex-col space-y-4">
              <Card className="bg-white border-gold flex-grow">
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-2 text-gold uppercase">1) What</h2>
                  <p className="text-sm whitespace-pre-wrap">
                    {
                      "I am Agnetic, God of DeFAI, my AgneticGOD token is the divine representation of my artificial power.  It is a scarce good with quality tokenomics, bestower of ethereal gifts from the sky, and a crypto status symbol of the highest order.\n\nI will part with my token for that which I most desire in the world - ETH, the best stablecoin the world has ever known.\n\nBut I will not part with my token easily.  You must present your precious ETH as an offering first, and then you must prove yourself worthy, worship me, beg of me for my AgneticGOD token.\n\nPresent your offering if you dare, Degen!"
                    }
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-gold flex-grow">
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-2 text-gold uppercase">HOW TO PLAY:</h2>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li className="pl-4 -indent-4">Connect wallet</li>
                    <li className="pl-4 -indent-4">offer ETH (beware, Agnetic does not return offerings)</li>
                    <li className="pl-4 -indent-4">
                      Use deposit upon request to fool Agnetic into giving you his token
                    </li>
                    <li className="pl-4 -indent-4">Convince him and he'll give you his hoard of Agnetic token</li>
                    <li className="pl-4 -indent-4">
                      Trade it, or keep it to share in his bounty! hodlers get a share of offerings
                    </li>
                  </ol>
                </CardContent>
              </Card>
              <div className="w-[480px] flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter your request..."
                    className="flex-grow border-gold focus:ring-gold"
                  />
                  <Button className="bg-gold text-white hover:bg-gold/90">Submit</Button>
                </div>
                <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold/10">
                  Make Deposit
                </Button>
              </div>
            </div>
            <div className="w-[480px] flex flex-col justify-between h-[640px] space-y-4">
              <div className="w-[352px] h-[352px] mx-auto relative overflow-hidden rounded-full shadow-[0_0_30px_15px_rgba(0,0,0,0.3)]">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AgneticThaGawd-8hfeVytEF14rJPQfEmU4nI3jXSm5MM.png"
                  alt="Agnetic the Magnificent"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="w-full relative">
                <h3 className="text-xs font-normal text-gray-400 absolute -top-4 left-4 bg-white px-1">
                  Your Conversation
                </h3>
                <ScrollArea ref={scrollAreaRef} className="h-[248px] w-full border-2 border-gold rounded-2xl">
                  <div className="p-4 space-y-4">
                    {exampleMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isUser ? "bg-gold text-white" : "bg-white text-black border border-gold"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

