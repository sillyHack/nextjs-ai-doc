"use client";

import { Button } from "../components/ui/button";
import { useChat } from "ai/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import {
	ArrowDown,
	RefreshCcw,
	RefreshCcwDot,
	Send,
	StopCircle,
} from "lucide-react";
import Markdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ChatApp = () => {
	const [showSources, setShowSources] = useState(false);
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		stop,
		isLoading,
		data,
		reload,
		setMessages,
	} = useChat({
		onFinish: () => {
			setShowSources(true);
		},
		onResponse: () => {
			setShowSources(false);
		},
		onError: () => {
			toast.error("Too many requests. Maximum 3 every 10 minutes.");
		},
	});

	let add_data = undefined;
	if (data) {
		add_data = JSON.parse(JSON.stringify(data[0]));
	}

	const resetMessages = () => {
		setMessages([]);
		stop();
	};

	const [autoScroll, setAutoScroll] = useState(true);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const isEmptyMessages = messages.length === 0;

	useEffect(() => {
		const chatContainer = chatContainerRef.current;
		if (!chatContainer) return;
		if (!autoScroll) return;

		const { scrollHeight, clientHeight } = chatContainer;

		chatContainer.scrollTop = scrollHeight - clientHeight;
	}, [autoScroll, messages]);

	useEffect(() => {
		// add event listener to scroll of chatContainerRef if defined
		const chatContainer = chatContainerRef.current;

		if (!chatContainer) return;

		const handleScroll = () => {
			const { scrollHeight, clientHeight, scrollTop } = chatContainer;

			if (scrollHeight - clientHeight - scrollTop <= 1) {
				setAutoScroll(true);
			} else {
				setAutoScroll(false);
			}
		};

		chatContainer.addEventListener("scroll", handleScroll);

		return () => {
			chatContainer.removeEventListener("scroll", handleScroll);
		};
	}, [messages.length]);

	return (
		<div
			className={cn("max-h-screen w-full flex flex-col gap-3 items-center", {
				"h-screen": isEmptyMessages,
				"justify-center": isEmptyMessages,
			})}
		>
			<h1
				className={cn("text-xl font-bold flex gap-3 items-center", {
					"text-2xl": isEmptyMessages,
				})}
			>
				<Image
					src="/assets/nextjs.svg"
					alt="NextJS Logo"
					width={40}
					height={40}
				/>
				Talk with NextJS Doc
			</h1>
			{!isEmptyMessages ? (
				<div
					className="flex flex-1 flex-col gap-3 max-w-2xl py-7 mx-auto stretch overflow-auto scroll-smooth"
					ref={chatContainerRef}
				>
					{messages.map((m) => (
						<Card key={m.id} className="whitespace-pre-wrap">
							<CardHeader>
								<CardTitle className="flex gap-3 items-center">
									{m.role === "user" ? (
										<p className="size-9 flex justify-center items-center rounded-full bg-gray-300">
											U
										</p>
									) : (
										<Image
											src="/assets/nextjs.svg"
											alt="NextJS Logo"
											width={40}
											height={40}
										/>
									)}
									{m.role === "user" ? "User" : "NextGPT"}
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-3">
								<Markdown className="prose">{m.content}</Markdown>
								{showSources && (
									<Markdown className="prose text-sm mt-10">
										{m.role !== "user" ? add_data["sources"] : ""}
									</Markdown>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			) : null}
			<form onSubmit={handleSubmit} className="w-full flex justify-center">
				<div className="p-3 w-full max-w-lg">
					{messages.length >= 1 ? (
						<div className="flex justify-start gap-3 mb-1">
							<Button onClick={resetMessages} disabled={isLoading}>
								<RefreshCcwDot size={16} className="mr-2" />
								Reset
							</Button>
							<Button onClick={() => reload()} disabled={isLoading}>
								<RefreshCcw size={16} className="mr-2" />
								Reload
							</Button>
							{!autoScroll ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setAutoScroll(true);
									}}
								>
									<ArrowDown size={16} className="mr-2" />
									Scroll
								</Button>
							) : null}
						</div>
					) : null}
					<div className="flex items-end gap-3">
						<Textarea
							className=" border border-gray-300 rounded shadow-xl"
							value={input}
							placeholder="Say something..."
							onChange={handleInputChange}
						/>
						{isLoading ? (
							<Button onClick={stop} className="bg-red-500">
								<StopCircle />
							</Button>
						) : (
							<Button>
								<Send size={16} />
							</Button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
};

export default ChatApp;
