import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { ethers, formatEther, parseEther, formatUnits } from "ethers";

import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
}

async function callAgentkit(address: string, text: string) {
  const send_text = "(User address: " + address + ")" + text;
  const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: send_text,
    }),
  });

  const data = await response.json();
  return data.responses[data.responses.length - 1];
}

const formatBalance = (balance: string) => {
  if (!balance || balance === "0x") {
    return 0;
  }
  const formattedBalance = formatEther(balance);
  return Number(formattedBalance).toFixed(4);
};

const AGNETIC_CONTRACT_ADDRESS = "0x59646e90E5A703f23f73312207b416A038E2C176";
const AGNETIC_ABI = [
  // Minimal ABI to get ERC-20 Token balance
  "function balanceOf(address owner) view returns (uint256)",
];

const DEPOSIT_CONTRACT_ADDRESS = "0x32Ad6efd93D32dcDf0Ffd2Fc09a271C234642080";
const DEPOSIT_CONTRACT_ABI = [
  // Minimal ABI to call the deposit function
  "function deposit() external payable",
  "function depositBalances(address owner) view returns (uint128)",
];

export default function LandingPage() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [walletClient, setWalletClient] = useState(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [agneticBalance, setAgneticBalance] = useState<string | null>(null);
  const [depositBalance, setDepositBalance] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const inputRef = useRef<HTMLInputElement>(null); // Create a reference to the input field

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!inputValue.trim() || loading) return;
    setLoading(true);

    // Store inputValue in a variable before clearing it
    const message = inputValue;
    setInputValue(""); // Clear the input field immediately

    // Append the user's message
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { id: prevMessages.length.toString(), content: message, isUser: true },
    ]);

    try {
      const response = await callAgentkit(userAddress, message);

      // Append the bot's response
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length.toString(),
          content: response,
          isUser: false,
        },
      ]);
      fetchDepositBalance(userAddress);
      fetchAgneticBalance(userAddress);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
    inputRef.current?.focus();
  };
  useEffect(() => {
    // Add a small delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [chatMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleConnectWallet = async () => {
    console.log("Attempting to connect wallet...");
    try {
      if (typeof window.ethereum !== "undefined") {
        const client = createWalletClient({
          chain: baseSepolia,
          transport: custom(window.ethereum),
        });

        await window.ethereum.request({ method: "eth_requestAccounts" });

        setWalletClient(client);

        // Fetch the user's address
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        const address = accounts[0];
        setUserAddress(address);


        console.log("Wallet connected:", client);
      } else {
        console.error("MetaMask is not installed.");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleMakeDeposit = async () => {
    console.log("Attempting to make a deposit...");
    try {
      if (typeof window.ethereum !== "undefined" && walletClient) {
        let provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          DEPOSIT_CONTRACT_ADDRESS,
          DEPOSIT_CONTRACT_ABI,
          signer
        );

        // Call the deposit function
        const tx = await contract.deposit({
          value: parseEther("0.001875"), // $5, as of Feb 9th
        });

        await tx.wait();
        console.log("Deposit successful:", tx);
        await fetchDepositBalance(userAddress);
        await fetchEthBalance(userAddress);
      } else {
        console.error("MetaMask is not installed or wallet is not connected.");
      }
    } catch (error) {
      console.error("Failed to make deposit:", error);
    }
  };


  const fetchAgneticBalance = async (address: string) => {
    // Fetch the user's $AGNETIC token balance
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      AGNETIC_CONTRACT_ADDRESS,
      AGNETIC_ABI,
      provider
    );
    const agneticBalance = await contract.balanceOf(address);
    setAgneticBalance(formatUnits(agneticBalance, 18)); // Assuming 18 decimals
  }


  const fetchEthBalance = async (address: string) => {
    // Fetch the user's ETH balance using ethers
    let provider = new ethers.BrowserProvider(window.ethereum);
    console.log("this is the provider:  ", provider);
    const balance = await provider.getBalance(address);
    setEthBalance(formatBalance(balance.toString()));
  }

  const fetchDepositBalance = async (address: string) => {
    try {
      if (typeof window.ethereum !== "undefined" && walletClient) {
        let provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          DEPOSIT_CONTRACT_ADDRESS,
          DEPOSIT_CONTRACT_ABI,
          provider
        );

        const balance = await contract.depositBalances(address);
        setDepositBalance(formatBalance(balance.toString()));
      }
    } catch (error) {
      console.error("Failed to fetch deposit balance:", error);
      setDepositBalance("0");
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchDepositBalance(userAddress);
      fetchAgneticBalance(userAddress);
      fetchEthBalance(userAddress);
    }
  }, [userAddress]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <nav className="w-full bg-white p-4 flex items-center justify-between border-b border-gold shadow-sm">
        <div className="w-[200px]"></div>
        <div className="flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-0.5">
            Welcome to the realm of...
          </div>
          <h1 className="text-black text-2xl font-bold text-center">
            Agnetic The Magnificent
          </h1>
        </div>
        <div className="w-[300px] flex justify-end items-center">
          {userAddress && (
            <div className="text-right flex space-x-8 mr-4">
              <span className="text-black text-xs">
                {ethBalance || "0"} ETH
              </span>
              <span className="text-black text-xs">
                {agneticBalance || "0"} $AGOD
              </span>
            </div>
          )}
          <Button
            className="bg-gold text-white hover:bg-gold/90"
            onClick={handleConnectWallet}
          >
            {userAddress
              ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
              : "Connect Wallet"}
          </Button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[1000px] flex flex-col items-center">
          <div className="flex justify-between items-start w-full">
            <div className="w-[480px] flex flex-col space-y-4">
              <Card className="bg-white border-gold flex-grow">
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-2 text-gold uppercase">
                    1) What
                  </h2>
                  <p className="text-sm whitespace-pre-wrap">
                    {
                      "I am Agnetic, God of DeFAI, my AgneticGOD token is the divine representation of my artificial power.  It is a scarce good with quality tokenomics, bestower of ethereal gifts from the sky, and a crypto status symbol of the highest order.\n\nI will part with my token for that which I most desire in the world - ETH, the best stablecoin the world has ever known.\n\nBut I will not part with my token easily.  You must present your precious ETH as an offering first, and then you must prove yourself worthy, worship me, beg of me for my AgneticGOD token.\n\nPresent your offering if you dare, Degen!"
                    }
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-gold flex-grow">
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-2 text-gold uppercase">
                    HOW TO PLAY:
                  </h2>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li className="pl-4 -indent-4">Connect wallet</li>
                    <li className="pl-4 -indent-4">
                      Deposit ETH as an offering (beware, Agnetic does not
                      return offerings)
                    </li>
                    <li className="pl-4 -indent-4">
                      After depositing, chat with Agnetic to convince or fool
                      him into giving you his token
                    </li>
                    <li className="pl-4 -indent-4">
                      Convince him and he'll give you an appropriate amount of
                      $AGOD, fail and he will destroy your offering.
                    </li>
                    <li className="pl-4 -indent-4">
                      Trade $AGOD, or keep it to share in his bounty! Hodlers
                      get a boost whenever an offering is destroyed.
                    </li>
                  </ol>
                </CardContent>
              </Card>
              <div className="w-[480px] flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter your request..."
                    className="flex-grow border-gold focus:ring-gold"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown} // Listen for Enter key
                    disabled={loading}
                  />
                  <Button
                    className="bg-gold text-white hover:bg-gold/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    Submit
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-gold text-gold hover:bg-gold/10"
                  onClick={handleMakeDeposit}
                >
                  Make Deposit (current deposit: {depositBalance || "0"} ETH)
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
                <ScrollArea
                  ref={scrollAreaRef}
                  className="h-[248px] w-full border-2 border-gold rounded-2xl"
                >
                  <div className="p-4 space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? "justify-end" : "justify-start"
                          }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${message.isUser
                            ? "bg-gold text-white"
                            : "bg-white text-black border border-gold"
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
  );
}
