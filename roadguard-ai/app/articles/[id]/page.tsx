"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Shield, Activity, Bell, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// The Database of Articles
interface ArticleContent {
  topic: string;
  title: string;
  color: string;
  icon: string;
  paragraphs: string[];
  sourceName: string;
  sourceUrl: string;
}

const articlesData: Record<string, ArticleContent> = {
  "helmet-negligence": {
    topic: "Helmet Negligence",
    title: "70% of Two-Wheeler Fatalities Involve Helmet Negligence",
    color: "red-500",
    icon: "Activity",
    paragraphs: [
      "Motorcycles and two-wheelers provide efficient transportation for millions globally, but they expose riders to significantly higher risks than enclosed vehicles. Because motorcycles lack a structural frame protecting the rider, the physical force of a crash is absorbed entirely by the rider's body.",
      "According to extensive research conducted by the World Health Organization (WHO) and regional transport ministries, a staggering 70% of fatalities or severe traumatic brain injuries in two-wheeler crashes involve victims who were either not wearing a helmet or wearing one improperly (unstrapped or non-standard). Head injuries are the leading cause of death and major morbidity among motorcyclists.",
      "Wearing a high-quality standard motorcycle helmet has been proven to reduce the risk of fatal injuries by up to 42% and head injuries by 69%.",
      "Implementing autonomous AI-driven detection systems like RoadGuard AI bridges the massive gap between rule formulation and strict enforcement. By instantly detecting uncovered riders, it significantly deters negligible behavior and acts as a massive preventative measure saving thousands of lives annually."
    ],
    sourceName: "World Health Organization (WHO) - Road Traffic Injuries",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries"
  },
  "accident-statistics": {
    topic: "Global Accident Rate",
    title: "1.5 Million Annual Road Accidents",
    color: "orange-500",
    icon: "Shield",
    paragraphs: [
      "The global road safety crisis is one of the most pressing public health emergencies of our time. Data from the World Health Organization indicates that approximately 1.19 million to 1.5 million people die each year as a result of road traffic crashes.",
      "A significant portion of these devastating accidents is directly attributed to human rule-breaking: over-speeding, driving under the influence, ignoring traffic signals, and failing to use motorcycle helmets or seat-belts.",
      "Between 20-50 million more people suffer non-fatal injuries, with many incurring disabilities as a result of their injury. Road traffic crashes cost most countries 3% of their respective gross domestic product.",
      "Autonomous monitoring systems act as an unblinking eye, forcing compliance in dangerous intersections through absolute accountability, systematically lowering these grim statistics."
    ],
    sourceName: "World Health Organization - Global Status Report on Road Safety",
    sourceUrl: "https://www.who.int/publications/i/item/9789240086517"
  },
  "manual-enforcement": {
    topic: "Enforcement Inefficiency",
    title: "The Bottleneck of Manual Enforcement",
    color: "yellow-500",
    icon: "Bell",
    paragraphs: [
      "Traditional manual traffic enforcement relies entirely on physical police presence at intersections. This approach is intrinsically flawed and highly inefficient due to human limitations, fatigue, and the sheer volume of modern traffic.",
      "Traffic police cannot supervise every lane 24/7. Rule violators quickly learn the exact locations and schedules of manual checkpoints, slowing down only when visible enforcement is present, and resuming dangerous behavior immediately after.",
      "Furthermore, retrieving accurate vehicle details in high-speed scenarios visually is highly error-prone and leads to disputed violations.",
      "Automated camera systems augmented with Artificial Intelligence solve this crisis. By processing thousands of frames per second, computer vision models can instantly identify un-helmeted riders, extract their license plates via OCR (Optical Character Recognition), and generate indisputable e-Challan evidence without human intervention."
    ],
    sourceName: "Ministry of Road Transport and Highways (MoRTH) - IT Initiatives",
    sourceUrl: "https://morth.nic.in/"
  }
};

const IconMap: Record<string, LucideIcon> = {
  Activity,
  Shield,
  Bell
};

export default function ArticlePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [article, setArticle] = useState<ArticleContent | null>(null);

  // We extract the slug manually via pathname to bypass Next.js 14 vs 15 Promise<params> complications!
  useEffect(() => {
    const slug = pathname.split("/").pop();
    if (slug && articlesData[slug]) {
      setArticle(articlesData[slug]);
    }
  }, [pathname]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-[var(--neon-blue)] border-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const IconComponent = IconMap[article.icon];

  return (
    <main className="flex-1 flex flex-col relative w-full mb-10 overflow-hidden min-h-screen">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-blue)] opacity-[0.1] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-[40%] h-[40%] bg-[var(--neon-green)] opacity-[0.1] blur-[150px] rounded-full pointer-events-none" />

      <section className="pt-24 pb-12 px-6 relative z-10 max-w-4xl mx-auto w-full">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-10 flex items-center text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
            <IconComponent className={`w-4 h-4 text-${article.color}`} />
            <span className={`text-sm text-${article.color} font-medium tracking-wide`}>{article.topic}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="w-full h-[1px] bg-gradient-to-r from-gray-800 to-transparent my-8"></div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1, duration: 0.5 }}
           className="space-y-8 text-gray-300 text-lg md:text-xl leading-relaxed mb-16"
        >
          {article.paragraphs.map((p, index) => (
             <p key={index} className="opacity-90">{p}</p>
          ))}
        </motion.div>

        {/* Sources Section */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.3 }}
        >
          <Card glow="none" className="p-8 bg-[#0a0a0a]/80 backdrop-blur-md border border-gray-800">
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-800 pb-4">
               Research & Sources
             </h3>
             <a 
               href={article.sourceUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center group"
             >
                <div className={`p-3 rounded-full bg-${article.color}/10 mr-4 group-hover:scale-110 transition-transform`}>
                   <ExternalLink className={`w-5 h-5 text-${article.color}`} />
                </div>
                <div>
                   <p className="text-white font-medium group-hover:text-[var(--neon-blue)] transition-colors">
                     {article.sourceName}
                   </p>
                   <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px] md:max-w-md">
                     {article.sourceUrl}
                   </p>
                </div>
             </a>
          </Card>
        </motion.div>

      </section>
    </main>
  );
}
