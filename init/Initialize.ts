import Campaign, { ICampaign } from "../models/Campaign";
import Ngo from "../models/NGO";
import User from "../models/User";
import bcrypt from 'bcryptjs';

const dummyNgos = [
    {
        title: "Oxfam",
        icon: "https://i0.wp.com/kailashafoundation.org/wp-content/uploads/2017/05/red-cross.png",
        Zakat_Rating: 5,
        Fitrana_Rating: 4,
        Sadqa_Rating: 3,
        Fidya_Rating: 2,
        Flood_Relief_Rating: 4,
        Ramazan_Package_Rating: 5,
        Kaffara_Rating: 3,
        Earthquake_Rating: 2,
        Khairat_Rating: 4,
        Orphan_Care_Rating: 5,
        Khummas_Rating: 3,
        Education_Rating: 4,
        Marriage_Rating: 5,
        Old_Age_Home_Rating: 2,
        Aqiqah_Rating: 3,
    },
    {
        title: "Save the Children",
        icon: "https://i0.wp.com/kailashafoundation.org/wp-content/uploads/2017/05/red-cross.png",
        Zakat_Rating: 5,
        Fitrana_Rating: 4,
        Sadqa_Rating: 3,
        Fidya_Rating: 2,
        Flood_Relief_Rating: 4,
        Ramazan_Package_Rating: 5,
        Kaffara_Rating: 3,
        Earthquake_Rating: 2,
        Khairat_Rating: 4,
        Orphan_Care_Rating: 5,
        Khummas_Rating: 3,
        Education_Rating: 4,
        Marriage_Rating: 5,
        Old_Age_Home_Rating: 2,
        Aqiqah_Rating: 3,
    },
    {
        title: "Doctors Without Borders",
        icon: "https://i0.wp.com/kailashafoundation.org/wp-content/uploads/2017/05/red-cross.png",
        Zakat_Rating: 5,
        Fitrana_Rating: 4,
        Sadqa_Rating: 3,
        Fidya_Rating: 2,
        Flood_Relief_Rating: 4,
        Ramazan_Package_Rating: 5,
        Kaffara_Rating: 3,
        Earthquake_Rating: 2,
        Khairat_Rating: 4,
        Orphan_Care_Rating: 5,
        Khummas_Rating: 3,
        Education_Rating: 4,
        Marriage_Rating: 5,
        Old_Age_Home_Rating: 2,
        Aqiqah_Rating: 3,
    },
];

const campaigns: Partial<ICampaign>[] = [
    {
        title: "Zakat",
        description: "Support those in need by contributing to our Zakat campaign. Your donations will make a significant difference in the lives of the less fortunate, providing them with essential assistance and opportunities for a better future.",
        image: "https://pennyappeal.org/storage/app/media/articles/zakat/shutterstock1622646313.jpg",
        progress: 80,
        amountRaised: 1999,
        total: 9999,
        donations: [],
        ngo: null, // Updated to include NGO ID
        type: "Zakat",
    },
    {
        title: "Donation",
        description: "Join us in our Donation campaign to make a positive impact on various important causes. Your generous contributions will help us continue our mission of providing aid to individuals and communities in need around the world.",
        image: "https://pennyappeal.org/storage/app/media/articles/zakat/shutterstock1622646313.jpg",
        progress: 50,
        amountRaised: 1999,
        total: 9999,
        donations: [],
        ngo: null, // Updated to include NGO ID
        type: "Fitrana",
    },
    {
        title: "Food Donation",
        description: "Take part in our Food Donation campaign and help combat hunger in your local community. Your support will enable us to distribute nutritious meals to those who are struggling, ensuring that no one goes to bed hungry.",
        image: "https://pennyappeal.org/storage/app/media/articles/zakat/shutterstock1622646313.jpg",
        progress: 60,
        amountRaised: 1999,
        total: 9999,
        donations: [],
        ngo: null, // Updated to include NGO ID
        type: "Sadqa",
    },
    {
        title: "Charity",
        description: "Get involved in our Charity campaign and be a force for good. Your contributions will be used to support a wide range of charitable initiatives, including education, healthcare, and relief efforts. Together, we can make a difference in the lives of countless individuals in need.",
        image: "https://pennyappeal.org/storage/app/media/articles/zakat/shutterstock1622646313.jpg",
        progress: 77,
        amountRaised: 1999,
        total: 9999,
        donations: [],
        ngo: null, // Updated to include NGO ID
        type: "Flood_Relief",
    }
];

export const initIfEmpty = async () => {
    try {
        await initManager();
        const ngoIsEmpty = await Ngo.countDocuments() === 0;
        const campaignIsEmpty = await Campaign.countDocuments() === 0;
        if (ngoIsEmpty) {
            await Ngo.insertMany(dummyNgos);
            console.log('Dummy NGOs added to the database.');
        } else {
            console.log('NGOs already exist in the database.');
        }
        if (campaignIsEmpty) {
            const allNgos = await Ngo.find();
            const campaignsWithNgoIds = campaigns.map(campaign => ({
                ...campaign,
                ngo: allNgos[Math.floor(Math.random() * allNgos.length)]._id,
            }));
            await Campaign.insertMany(campaignsWithNgoIds);
            console.log('Campaigns added to the database.');
        } else {
            console.log('Campaigns already exist in the database.');
        }
    } catch (error) {
        console.error('Error occurred while initializing:', error);
    }
};

async function initManager() {
    try {
      // Check if a manager already exists
      const existingManager = await User.findOne({ role: "Manager" });
      if (existingManager) {
        console.log("Manager user already exists.");
        return; // Exit the function, no need to create another
      }
      console.log("Manager not found. Creating one now...");
      console.log("Username: manager")
      console.log("Email: manager@gmail.com")
      console.log("Password: password")
  
      // If no manager found, create one
      // const hashedPassword = await bcrypt.hash("password", 10); // Always hash passwords 
  
      // If no manager found, create one
      const hashedPassword = await bcrypt.hash("password", 10); // Always hash passwords
      const newManager = new User({
        fullname: "Manager",
        username: "manager",
        email: "manager@gmail.com",
        password: hashedPassword,
        role: "Manager",
      });
  
      await newManager.save();
      console.log("Manager user created successfully.");
    } catch (error) {
      console.error("Error occurred while initializing manager:", error); 
      // Log the error to aid debugging
    }
  }

