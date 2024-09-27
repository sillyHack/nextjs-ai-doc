"use client";

import { Button } from "../components/ui/button";
import { useChat } from "ai/react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Send, StopCircle } from "lucide-react";
import Markdown from "react-markdown";

const ChatApp = () => {
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		stop,
		isLoading,
		data,
	} = useChat();

	let add_data = undefined;
	if (data) {
		add_data = JSON.parse(JSON.stringify(data[0]));
	}

	return (
		<div className="flex flex-col gap-3 items-center">
			<h1 className="text-xl font-bold flex gap-3 items-center">
				<Image
					src="/assets/nextjs.svg"
					alt="NextJS Logo"
					width={40}
					height={40}
				/>
				Talk with NextJS Doc
			</h1>
			<div className="flex flex-col w-full gap-3 max-w-lg py-24 mx-auto stretch">
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
								{m.role === "user" ? "User says: " : "Assistant says: "}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Markdown className="prose">{m.content}</Markdown>
						</CardContent>
						{add_data && (
							<CardFooter>
								<Markdown className="prose">
									{m.role !== "user" ? add_data["sources"] : ""}
								</Markdown>
							</CardFooter>
						)}
					</Card>
				))}

				<form onSubmit={handleSubmit}>
					<div className="fixed bg-white bottom-0 left-1/4 w-full max-w-lg p-2 pb-10 flex items-end gap-3">
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
				</form>
			</div>
		</div>
	);
};

export default ChatApp;
