import chart from "./assets/media/f1.svg";
import search from "./assets/media/Search.svg";
import searchb from "./assets/media/Searchb.svg";
import graph from "./assets/media/Graph.svg";
import discount from "./assets/media/Discount.svg";
import bag2 from "./assets/media/Bag2.svg";
import user from "./assets/media/User.svg";
import folder from "./assets/media/Folder.svg";
import document from "./assets/media/Document.svg";

import p1 from "./assets/img/p1.png";
import p2 from "./assets/img/p2.png";
import p3 from "./assets/img/p3.png";

export const navData = [
    {
        name: 'Home',
        href: '#/',
    },
    {
        name: 'Your benefits',
        href: '#/',
    },
    {
        name: 'Our process',
        href: '#/',
    },
    {
        name: 'Our Works',
        href: '#/',
    },
    {
        name: 'Testimonials',
        href: '#/',
    },
    {
        name: 'Start a project',
        href: '#/',
    },
]

export const cardInfo = [
    {
        image: chart,
        heading: 'Grow your business',
        description: "The magic wand for success is in figuring out how to bring in the profits and ensure the capacity needed to sustain that growth for posterity.",
        color: "#FFE7DB",
    },
    {
        image: discount,
        heading: 'Drive more sales',
        description: "A potential customer, once lost, is hard to retain back. But keeping some critical factors in mind, we can, for sure, use these loyalty programs as customer retention tools.",
        color: "#E7F2EF",
    },
    {
        image: user,
        heading: 'Handle by Expert',
        description: "We know how we candevelop deep, trust-based relationships with our clients, and work together more collaboratively.",
        color: "#FAF3D8",
    },
    {
        image: search,
        heading: 'UX Research',
        description: "UX research is the systematic study of target users and their requirements, to add realistic contexts and insights to design processes.",
        color: "#C0F2EF",
    },
    {
        image: graph,
        heading: 'Case Management',
        description: "Track case progress and deadlines, Manage case files and documents, Assign tasks and monitor completion",
        color: "#EDE7F2",
    },
    {
        image: bag2,
        heading: 'Data tracking',
        description: "The hardware and software, which when used together allows you to know where something is at any point in time.",
        color: "#D8F0FA",
    },

]

export const colorVariants = {
    "#FFE7DB": "bg-[#FFE7DB]",
    "#E7F2EF": "bg-[#E7F2EF]",
    "#FAF3D8": "bg-[#FAF3D8]",
    "#C0F2EF": "bg-[#C0F2EF]",
    "#EDE7F2": "bg-[#EDE7F2]",
    "#D8F0FA": "bg-[#D8F0FA]",

    // 
    "#DAE6FF": "bg-[#DAE6FF]",
    "#E9E5FF": "bg-[#E9E5FF]",
    "#CEEDFF": "bg-[#CEEDFF]",

};

export const ProcessInfo = [
    {
        image: p1,
        heading: 'Case and Client Management',
        description: "Track case progress and deadlines, Manage case files and documents, Assign tasks and monitor completion.",
        color: "#DAE6FF",
        icon: searchb
    },
    {
        image: p2,
        heading: 'Task and Deadline Tracking',
        description: "Create and assign tasks with due dates, Set reminders and notifications for upcoming deadlines, Monitor task progress and completion",
        color: "#E9E5FF",
        icon: folder
    },
    {
        image: p3,
        heading: 'Reporting and Analytics',
        description: "Generate reports on case status, billing, and productivity, Analyze firm performance and client metrics, Customizable dashboards for quick insights. ",
        color: "#CEEDFF",
        icon: document
    },

]
