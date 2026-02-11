import { FiHelpCircle, FiSettings, FiUser } from "react-icons/fi";

export const mockFAQ = [
    {
        id: 1,
        icon: FiHelpCircle,
        question: "What services do you offer?",
        category: "General",
        lastUpdated: "2024-01-10",
        publishDate: "2023-05-01",
        status: "Published",
    },
    {
        id: 2,
        icon: FiSettings,
        question: "How do I request a quote?",
        category: "Process",
        lastUpdated: "2023-11-20",
        publishDate: "2023-06-15",
        status: "Published",
    },
    {
        id: 3,
        icon: FiUser,
        question: "Are you hiring?",
        category: "Careers",
        lastUpdated: "2024-02-01",
        publishDate: "2023-09-01",
        status: "Draft",
    },
];
