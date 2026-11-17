import {
  CityLocation,
  CareerAndAuraProfile,
  IndianFestivalPersonalized,
  ChakraMaritalChallenge,
} from '../types';
import {
  PLANETARY_PROFILES,
  getPlanetaryRelationship,
  reduceToSingleDigit,
} from './numerology';

export const GLOBAL_CITIES_DATABASE: CityLocation[] = [
  // Major & Tier-2/3 Indian Cities across all States & Union Territories
  { city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090, tzOffset: 5.5 },
  { city: 'Delhi', state: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, tzOffset: 5.5 },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777, tzOffset: 5.5 },
  { city: 'Navi Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0330, lng: 73.0297, tzOffset: 5.5 },
  { city: 'Thane', state: 'Maharashtra', country: 'India', lat: 19.2183, lng: 72.9781, tzOffset: 5.5 },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946, tzOffset: 5.5 },
  { city: 'Bangalore', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946, tzOffset: 5.5 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639, tzOffset: 5.5 },
  { city: 'Howrah', state: 'West Bengal', country: 'India', lat: 22.5958, lng: 88.2636, tzOffset: 5.5 },
  { city: 'Siliguri', state: 'West Bengal', country: 'India', lat: 26.7271, lng: 88.3953, tzOffset: 5.5 },
  { city: 'Durgapur', state: 'West Bengal', country: 'India', lat: 23.5204, lng: 87.3119, tzOffset: 5.5 },
  { city: 'Asansol', state: 'West Bengal', country: 'India', lat: 23.6739, lng: 86.9524, tzOffset: 5.5 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707, tzOffset: 5.5 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867, tzOffset: 5.5 },
  { city: 'Secunderabad', state: 'Telangana', country: 'India', lat: 17.4399, lng: 78.4983, tzOffset: 5.5 },
  { city: 'Warangal', state: 'Telangana', country: 'India', lat: 17.9689, lng: 79.5941, tzOffset: 5.5 },
  { city: 'Nizamabad', state: 'Telangana', country: 'India', lat: 18.6725, lng: 78.0941, tzOffset: 5.5 },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714, tzOffset: 5.5 },
  { city: 'Gandhinagar', state: 'Gujarat', country: 'India', lat: 23.2156, lng: 72.6369, tzOffset: 5.5 },
  { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567, tzOffset: 5.5 },
  { city: 'Surat', state: 'Gujarat', country: 'India', lat: 21.1702, lng: 72.8311, tzOffset: 5.5 },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lng: 75.7873, tzOffset: 5.5 },
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462, tzOffset: 5.5 },
  { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India', lat: 26.4499, lng: 80.3319, tzOffset: 5.5 },
  { city: 'Nagpur', state: 'Maharashtra', country: 'India', lat: 21.1458, lng: 79.0882, tzOffset: 5.5 },
  { city: 'Indore', state: 'Madhya Pradesh', country: 'India', lat: 22.7196, lng: 75.8577, tzOffset: 5.5 },
  { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', lat: 23.2599, lng: 77.4126, tzOffset: 5.5 },
  { city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', lat: 25.3176, lng: 82.9739, tzOffset: 5.5 },
  { city: 'Prayagraj', state: 'Uttar Pradesh', country: 'India', lat: 25.4358, lng: 81.8463, tzOffset: 5.5 },
  { city: 'Allahabad', state: 'Uttar Pradesh', country: 'India', lat: 25.4358, lng: 81.8463, tzOffset: 5.5 },
  { city: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', lat: 26.7922, lng: 82.1998, tzOffset: 5.5 },
  { city: 'Mathura', state: 'Uttar Pradesh', country: 'India', lat: 27.4924, lng: 77.6737, tzOffset: 5.5 },
  { city: 'Vrindavan', state: 'Uttar Pradesh', country: 'India', lat: 27.5650, lng: 77.6593, tzOffset: 5.5 },
  { city: 'Gorakhpur', state: 'Uttar Pradesh', country: 'India', lat: 26.7606, lng: 83.3732, tzOffset: 5.5 },
  { city: 'Bareilly', state: 'Uttar Pradesh', country: 'India', lat: 28.3670, lng: 79.4304, tzOffset: 5.5 },
  { city: 'Aligarh', state: 'Uttar Pradesh', country: 'India', lat: 27.8974, lng: 78.0880, tzOffset: 5.5 },
  { city: 'Moradabad', state: 'Uttar Pradesh', country: 'India', lat: 28.8386, lng: 78.7733, tzOffset: 5.5 },
  { city: 'Saharanpur', state: 'Uttar Pradesh', country: 'India', lat: 29.9680, lng: 77.5552, tzOffset: 5.5 },
  { city: 'Jhansi', state: 'Uttar Pradesh', country: 'India', lat: 25.4484, lng: 78.5685, tzOffset: 5.5 },
  { city: 'Muzaffarnagar', state: 'Uttar Pradesh', country: 'India', lat: 29.4727, lng: 77.7085, tzOffset: 5.5 },
  { city: 'Haridwar', state: 'Uttarakhand', country: 'India', lat: 29.9457, lng: 78.1642, tzOffset: 5.5 },
  { city: 'Rishikesh', state: 'Uttarakhand', country: 'India', lat: 30.0869, lng: 78.2676, tzOffset: 5.5 },
  { city: 'Dehradun', state: 'Uttarakhand', country: 'India', lat: 30.3165, lng: 78.0322, tzOffset: 5.5 },
  { city: 'Haldwani', state: 'Uttarakhand', country: 'India', lat: 29.2183, lng: 79.5130, tzOffset: 5.5 },
  { city: 'Nainital', state: 'Uttarakhand', country: 'India', lat: 29.3919, lng: 79.4542, tzOffset: 5.5 },
  { city: 'Roorkee', state: 'Uttarakhand', country: 'India', lat: 29.8543, lng: 77.8880, tzOffset: 5.5 },
  { city: 'Patna', state: 'Bihar', country: 'India', lat: 25.5941, lng: 85.1376, tzOffset: 5.5 },
  { city: 'Gaya', state: 'Bihar', country: 'India', lat: 24.7914, lng: 85.0002, tzOffset: 5.5 },
  { city: 'Muzaffarpur', state: 'Bihar', country: 'India', lat: 26.1197, lng: 85.3910, tzOffset: 5.5 },
  { city: 'Bhagalpur', state: 'Bihar', country: 'India', lat: 25.2425, lng: 86.9842, tzOffset: 5.5 },
  { city: 'Darbhanga', state: 'Bihar', country: 'India', lat: 26.1542, lng: 85.8918, tzOffset: 5.5 },
  { city: 'Purnia', state: 'Bihar', country: 'India', lat: 25.7771, lng: 87.4753, tzOffset: 5.5 },
  { city: 'Ranchi', state: 'Jharkhand', country: 'India', lat: 23.3441, lng: 85.3096, tzOffset: 5.5 },
  { city: 'Jamshedpur', state: 'Jharkhand', country: 'India', lat: 22.8046, lng: 86.2029, tzOffset: 5.5 },
  { city: 'Dhanbad', state: 'Jharkhand', country: 'India', lat: 23.7957, lng: 86.4304, tzOffset: 5.5 },
  { city: 'Bokaro', state: 'Jharkhand', country: 'India', lat: 23.6693, lng: 86.1511, tzOffset: 5.5 },
  { city: 'Deoghar', state: 'Jharkhand', country: 'India', lat: 24.4852, lng: 86.6948, tzOffset: 5.5 },
  { city: 'Bhubaneswar', state: 'Odisha', country: 'India', lat: 20.2961, lng: 85.8245, tzOffset: 5.5 },
  { city: 'Cuttack', state: 'Odisha', country: 'India', lat: 20.4625, lng: 85.8830, tzOffset: 5.5 },
  { city: 'Rourkela', state: 'Odisha', country: 'India', lat: 22.2604, lng: 84.8536, tzOffset: 5.5 },
  { city: 'Puri', state: 'Odisha', country: 'India', lat: 19.8135, lng: 85.8312, tzOffset: 5.5 },
  { city: 'Chandigarh', state: 'Chandigarh', country: 'India', lat: 30.7333, lng: 76.7794, tzOffset: 5.5 },
  { city: 'Mohali', state: 'Punjab', country: 'India', lat: 30.7046, lng: 76.7179, tzOffset: 5.5 },
  { city: 'Panchkula', state: 'Haryana', country: 'India', lat: 30.6942, lng: 76.8606, tzOffset: 5.5 },
  { city: 'Amritsar', state: 'Punjab', country: 'India', lat: 31.6340, lng: 74.8723, tzOffset: 5.5 },
  { city: 'Ludhiana', state: 'Punjab', country: 'India', lat: 30.9010, lng: 75.8573, tzOffset: 5.5 },
  { city: 'Jalandhar', state: 'Punjab', country: 'India', lat: 31.3260, lng: 75.5762, tzOffset: 5.5 },
  { city: 'Patiala', state: 'Punjab', country: 'India', lat: 30.3398, lng: 76.3869, tzOffset: 5.5 },
  { city: 'Bathinda', state: 'Punjab', country: 'India', lat: 30.2110, lng: 74.9455, tzOffset: 5.5 },
  { city: 'Gurugram', state: 'Haryana', country: 'India', lat: 28.4595, lng: 77.0266, tzOffset: 5.5 },
  { city: 'Gurgaon', state: 'Haryana', country: 'India', lat: 28.4595, lng: 77.0266, tzOffset: 5.5 },
  { city: 'Faridabad', state: 'Haryana', country: 'India', lat: 28.4089, lng: 77.3178, tzOffset: 5.5 },
  { city: 'Panipat', state: 'Haryana', country: 'India', lat: 29.3909, lng: 76.9635, tzOffset: 5.5 },
  { city: 'Ambala', state: 'Haryana', country: 'India', lat: 30.3782, lng: 76.7767, tzOffset: 5.5 },
  { city: 'Karnal', state: 'Haryana', country: 'India', lat: 29.6857, lng: 76.9905, tzOffset: 5.5 },
  { city: 'Hisar', state: 'Haryana', country: 'India', lat: 29.1492, lng: 75.7217, tzOffset: 5.5 },
  { city: 'Rohtak', state: 'Haryana', country: 'India', lat: 28.8955, lng: 76.6066, tzOffset: 5.5 },
  { city: 'Sonipat', state: 'Haryana', country: 'India', lat: 28.9931, lng: 77.0151, tzOffset: 5.5 },
  { city: 'Kurukshetra', state: 'Haryana', country: 'India', lat: 29.9695, lng: 76.8783, tzOffset: 5.5 },
  { city: 'Noida', state: 'Uttar Pradesh', country: 'India', lat: 28.5355, lng: 77.3910, tzOffset: 5.5 },
  { city: 'Greater Noida', state: 'Uttar Pradesh', country: 'India', lat: 28.4744, lng: 77.5040, tzOffset: 5.5 },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', lat: 28.6692, lng: 77.4538, tzOffset: 5.5 },
  { city: 'Agra', state: 'Uttar Pradesh', country: 'India', lat: 27.1767, lng: 78.0081, tzOffset: 5.5 },
  { city: 'Meerut', state: 'Uttar Pradesh', country: 'India', lat: 28.9845, lng: 77.7064, tzOffset: 5.5 },
  { city: 'Udaipur', state: 'Rajasthan', country: 'India', lat: 24.5854, lng: 73.7125, tzOffset: 5.5 },
  { city: 'Jodhpur', state: 'Rajasthan', country: 'India', lat: 26.2389, lng: 73.0243, tzOffset: 5.5 },
  { city: 'Kota', state: 'Rajasthan', country: 'India', lat: 25.2138, lng: 75.8648, tzOffset: 5.5 },
  { city: 'Ajmer', state: 'Rajasthan', country: 'India', lat: 26.4499, lng: 74.6399, tzOffset: 5.5 },
  { city: 'Bikaner', state: 'Rajasthan', country: 'India', lat: 28.0229, lng: 73.3119, tzOffset: 5.5 },
  { city: 'Alwar', state: 'Rajasthan', country: 'India', lat: 27.5530, lng: 76.6346, tzOffset: 5.5 },
  { city: 'Bhilwara', state: 'Rajasthan', country: 'India', lat: 25.3407, lng: 74.6313, tzOffset: 5.5 },
  { city: 'Sikar', state: 'Rajasthan', country: 'India', lat: 27.6094, lng: 75.1398, tzOffset: 5.5 },
  { city: 'Vadodara', state: 'Gujarat', country: 'India', lat: 22.3072, lng: 73.1812, tzOffset: 5.5 },
  { city: 'Rajkot', state: 'Gujarat', country: 'India', lat: 22.3039, lng: 70.8022, tzOffset: 5.5 },
  { city: 'Bhavnagar', state: 'Gujarat', country: 'India', lat: 21.7645, lng: 72.1519, tzOffset: 5.5 },
  { city: 'Jamnagar', state: 'Gujarat', country: 'India', lat: 22.4707, lng: 70.0577, tzOffset: 5.5 },
  { city: 'Anand', state: 'Gujarat', country: 'India', lat: 22.5645, lng: 72.9289, tzOffset: 5.5 },
  { city: 'Vapi', state: 'Gujarat', country: 'India', lat: 20.3893, lng: 72.9106, tzOffset: 5.5 },
  { city: 'Nashik', state: 'Maharashtra', country: 'India', lat: 19.9975, lng: 73.7898, tzOffset: 5.5 },
  { city: 'Aurangabad', state: 'Maharashtra', country: 'India', lat: 19.8762, lng: 75.3433, tzOffset: 5.5 },
  { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', country: 'India', lat: 19.8762, lng: 75.3433, tzOffset: 5.5 },
  { city: 'Solapur', state: 'Maharashtra', country: 'India', lat: 17.6599, lng: 75.9064, tzOffset: 5.5 },
  { city: 'Kolhapur', state: 'Maharashtra', country: 'India', lat: 16.7050, lng: 74.2433, tzOffset: 5.5 },
  { city: 'Amravati', state: 'Maharashtra', country: 'India', lat: 20.9320, lng: 77.7523, tzOffset: 5.5 },
  { city: 'Akola', state: 'Maharashtra', country: 'India', lat: 20.7002, lng: 77.0082, tzOffset: 5.5 },
  { city: 'Shirdi', state: 'Maharashtra', country: 'India', lat: 19.7645, lng: 74.4762, tzOffset: 5.5 },
  { city: 'Ujjain', state: 'Madhya Pradesh', country: 'India', lat: 23.1765, lng: 75.7885, tzOffset: 5.5 },
  { city: 'Gwalior', state: 'Madhya Pradesh', country: 'India', lat: 26.2183, lng: 78.1828, tzOffset: 5.5 },
  { city: 'Jabalpur', state: 'Madhya Pradesh', country: 'India', lat: 23.1815, lng: 79.9864, tzOffset: 5.5 },
  { city: 'Rewa', state: 'Madhya Pradesh', country: 'India', lat: 24.5362, lng: 81.3037, tzOffset: 5.5 },
  { city: 'Sagar', state: 'Madhya Pradesh', country: 'India', lat: 23.8388, lng: 78.7378, tzOffset: 5.5 },
  { city: 'Satna', state: 'Madhya Pradesh', country: 'India', lat: 24.6005, lng: 80.8322, tzOffset: 5.5 },
  { city: 'Ratlam', state: 'Madhya Pradesh', country: 'India', lat: 23.3315, lng: 75.0367, tzOffset: 5.5 },
  { city: 'Raipur', state: 'Chhattisgarh', country: 'India', lat: 21.2514, lng: 81.6296, tzOffset: 5.5 },
  { city: 'Bhilai', state: 'Chhattisgarh', country: 'India', lat: 21.1938, lng: 81.3509, tzOffset: 5.5 },
  { city: 'Bilaspur', state: 'Chhattisgarh', country: 'India', lat: 22.0797, lng: 82.1409, tzOffset: 5.5 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', lat: 17.6868, lng: 83.2185, tzOffset: 5.5 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', lat: 16.5062, lng: 80.6480, tzOffset: 5.5 },
  { city: 'Guntur', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lng: 80.4365, tzOffset: 5.5 },
  { city: 'Nellore', state: 'Andhra Pradesh', country: 'India', lat: 14.4426, lng: 79.9865, tzOffset: 5.5 },
  { city: 'Tirupati', state: 'Andhra Pradesh', country: 'India', lat: 13.6288, lng: 79.4192, tzOffset: 5.5 },
  { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lng: 76.9558, tzOffset: 5.5 },
  { city: 'Madurai', state: 'Tamil Nadu', country: 'India', lat: 9.9252, lng: 78.1198, tzOffset: 5.5 },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', lat: 10.7905, lng: 78.7047, tzOffset: 5.5 },
  { city: 'Salem', state: 'Tamil Nadu', country: 'India', lat: 11.6643, lng: 78.1460, tzOffset: 5.5 },
  { city: 'Vellore', state: 'Tamil Nadu', country: 'India', lat: 12.9165, lng: 79.1325, tzOffset: 5.5 },
  { city: 'Mysuru', state: 'Karnataka', country: 'India', lat: 12.2958, lng: 76.6394, tzOffset: 5.5 },
  { city: 'Mysore', state: 'Karnataka', country: 'India', lat: 12.2958, lng: 76.6394, tzOffset: 5.5 },
  { city: 'Mangaluru', state: 'Karnataka', country: 'India', lat: 12.9141, lng: 74.8560, tzOffset: 5.5 },
  { city: 'Hubballi', state: 'Karnataka', country: 'India', lat: 15.3647, lng: 75.1240, tzOffset: 5.5 },
  { city: 'Belagavi', state: 'Karnataka', country: 'India', lat: 15.8497, lng: 74.4977, tzOffset: 5.5 },
  { city: 'Udupi', state: 'Karnataka', country: 'India', lat: 13.3409, lng: 74.7421, tzOffset: 5.5 },
  { city: 'Kochi', state: 'Kerala', country: 'India', lat: 9.9312, lng: 76.2673, tzOffset: 5.5 },
  { city: 'Thiruvananthapuram', state: 'Kerala', country: 'India', lat: 8.5241, lng: 76.9366, tzOffset: 5.5 },
  { city: 'Kozhikode', state: 'Kerala', country: 'India', lat: 11.2588, lng: 75.7804, tzOffset: 5.5 },
  { city: 'Thrissur', state: 'Kerala', country: 'India', lat: 10.5276, lng: 76.2144, tzOffset: 5.5 },
  { city: 'Guwahati', state: 'Assam', country: 'India', lat: 26.1445, lng: 91.7362, tzOffset: 5.5 },
  { city: 'Dibrugarh', state: 'Assam', country: 'India', lat: 27.4728, lng: 94.9120, tzOffset: 5.5 },
  { city: 'Silchar', state: 'Assam', country: 'India', lat: 24.8333, lng: 92.7789, tzOffset: 5.5 },
  { city: 'Shillong', state: 'Meghalaya', country: 'India', lat: 25.5788, lng: 91.8933, tzOffset: 5.5 },
  { city: 'Imphal', state: 'Manipur', country: 'India', lat: 24.8170, lng: 93.9368, tzOffset: 5.5 },
  { city: 'Agartala', state: 'Tripura', country: 'India', lat: 23.8315, lng: 91.2868, tzOffset: 5.5 },
  { city: 'Gangtok', state: 'Sikkim', country: 'India', lat: 27.3389, lng: 88.6065, tzOffset: 5.5 },
  { city: 'Shimla', state: 'Himachal Pradesh', country: 'India', lat: 31.1048, lng: 77.1734, tzOffset: 5.5 },
  { city: 'Dharamshala', state: 'Himachal Pradesh', country: 'India', lat: 32.2190, lng: 76.3234, tzOffset: 5.5 },
  { city: 'Manali', state: 'Himachal Pradesh', country: 'India', lat: 32.2432, lng: 77.1892, tzOffset: 5.5 },
  { city: 'Solan', state: 'Himachal Pradesh', country: 'India', lat: 30.9045, lng: 77.0967, tzOffset: 5.5 },
  { city: 'Jammu', state: 'Jammu & Kashmir', country: 'India', lat: 32.7266, lng: 74.8570, tzOffset: 5.5 },
  { city: 'Srinagar', state: 'Jammu & Kashmir', country: 'India', lat: 34.0837, lng: 74.7973, tzOffset: 5.5 },
  { city: 'Leh', state: 'Ladakh', country: 'India', lat: 34.1526, lng: 77.5771, tzOffset: 5.5 },
  { city: 'Panaji', state: 'Goa', country: 'India', lat: 15.4909, lng: 73.8278, tzOffset: 5.5 },
  { city: 'Margao', state: 'Goa', country: 'India', lat: 15.2832, lng: 73.9862, tzOffset: 5.5 },
  { city: 'Puducherry', state: 'Puducherry', country: 'India', lat: 11.9416, lng: 79.8083, tzOffset: 5.5 },
  // Global Cities
  { city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, tzOffset: 4.0 },
  { city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.4539, lng: 54.3773, tzOffset: 4.0 },
  { city: 'Sharjah', state: 'Sharjah', country: 'United Arab Emirates', lat: 25.3463, lng: 55.4209, tzOffset: 4.0 },
  { city: 'Doha', state: 'Ad Dawhah', country: 'Qatar', lat: 25.2854, lng: 51.5310, tzOffset: 3.0 },
  { city: 'Muscat', state: 'Muscat', country: 'Oman', lat: 23.5880, lng: 58.3829, tzOffset: 4.0 },
  { city: 'Riyadh', state: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, tzOffset: 3.0 },
  { city: 'Jeddah', state: 'Makkah', country: 'Saudi Arabia', lat: 21.5433, lng: 39.1728, tzOffset: 3.0 },
  { city: 'London', state: 'England', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, tzOffset: 0.0 },
  { city: 'Birmingham', state: 'England', country: 'United Kingdom', lat: 52.4862, lng: -1.8904, tzOffset: 0.0 },
  { city: 'Manchester', state: 'England', country: 'United Kingdom', lat: 53.4808, lng: -2.2426, tzOffset: 0.0 },
  { city: 'Leicester', state: 'England', country: 'United Kingdom', lat: 52.6369, lng: -1.1398, tzOffset: 0.0 },
  { city: 'New York', state: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, tzOffset: -5.0 },
  { city: 'Jersey City', state: 'New Jersey', country: 'United States', lat: 40.7178, lng: -74.0431, tzOffset: -5.0 },
  { city: 'San Francisco', state: 'California', country: 'United States', lat: 37.7749, lng: -122.4194, tzOffset: -8.0 },
  { city: 'San Jose', state: 'California', country: 'United States', lat: 37.3382, lng: -121.8863, tzOffset: -8.0 },
  { city: 'Los Angeles', state: 'California', country: 'United States', lat: 34.0522, lng: -118.2437, tzOffset: -8.0 },
  { city: 'Chicago', state: 'Illinois', country: 'United States', lat: 41.8781, lng: -87.6298, tzOffset: -6.0 },
  { city: 'Houston', state: 'Texas', country: 'United States', lat: 29.7604, lng: -95.3698, tzOffset: -6.0 },
  { city: 'Dallas', state: 'Texas', country: 'United States', lat: 32.7767, lng: -96.7970, tzOffset: -6.0 },
  { city: 'Atlanta', state: 'Georgia', country: 'United States', lat: 33.7490, lng: -84.3880, tzOffset: -5.0 },
  { city: 'Seattle', state: 'Washington', country: 'United States', lat: 47.6062, lng: -122.3321, tzOffset: -8.0 },
  { city: 'Toronto', state: 'Ontario', country: 'Canada', lat: 43.6532, lng: -79.3832, tzOffset: -5.0 },
  { city: 'Brampton', state: 'Ontario', country: 'Canada', lat: 43.7315, lng: -79.7624, tzOffset: -5.0 },
  { city: 'Vancouver', state: 'British Columbia', country: 'Canada', lat: 49.2827, lng: -123.1207, tzOffset: -8.0 },
  { city: 'Calgary', state: 'Alberta', country: 'Canada', lat: 51.0447, lng: -114.0719, tzOffset: -7.0 },
  { city: 'Singapore', state: 'Central Region', country: 'Singapore', lat: 1.3521, lng: 103.8198, tzOffset: 8.0 },
  { city: 'Sydney', state: 'New South Wales', country: 'Australia', lat: -33.8688, lng: 151.2093, tzOffset: 10.0 },
  { city: 'Melbourne', state: 'Victoria', country: 'Australia', lat: -37.8136, lng: 144.9631, tzOffset: 10.0 },
  { city: 'Brisbane', state: 'Queensland', country: 'Australia', lat: -27.4698, lng: 153.0251, tzOffset: 10.0 },
  { city: 'Perth', state: 'Western Australia', country: 'Australia', lat: -31.9505, lng: 115.8605, tzOffset: 8.0 },
  { city: 'Auckland', state: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633, tzOffset: 12.0 },
  { city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', lat: 27.7172, lng: 85.3240, tzOffset: 5.75 },
  { city: 'Colombo', state: 'Western Province', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612, tzOffset: 5.5 },
  { city: 'Dhaka', state: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, tzOffset: 6.0 },
  { city: 'Bangkok', state: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, tzOffset: 7.0 },
  { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan', country: 'Malaysia', lat: 3.1390, lng: 101.6869, tzOffset: 8.0 },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, tzOffset: 9.0 },
  { city: 'Paris', state: 'Ile-de-France', country: 'France', lat: 48.8566, lng: 2.3522, tzOffset: 1.0 },
  { city: 'Frankfurt', state: 'Hesse', country: 'Germany', lat: 50.1109, lng: 8.6821, tzOffset: 1.0 },
  { city: 'Berlin', state: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, tzOffset: 1.0 },
  { city: 'Port Louis', state: 'Port Louis', country: 'Mauritius', lat: -20.1609, lng: 57.5012, tzOffset: 4.0 },
];

// Live Geocoding API with Instant 3-Character Prefix Matching (Open-Meteo Geocoding API - Free, No Key Needed)
export async function searchCityGeocode(query: string): Promise<CityLocation[]> {
  // Extract the primary city search token (before any comma if the user is editing)
  const rawTrimmed = query.trim();
  const primaryToken = rawTrimmed.split(',')[0].trim().toLowerCase();
  const q = primaryToken || rawTrimmed.toLowerCase();
  if (!q) return GLOBAL_CITIES_DATABASE.slice(0, 8);

  // 1. Prioritize cities whose name starts with the typed 3+ characters
  const prefixMatches = GLOBAL_CITIES_DATABASE.filter((c) =>
    c.city.toLowerCase().startsWith(q)
  );
  // 2. Include secondary matches where city, state, or country contains the query
  const substringMatches = GLOBAL_CITIES_DATABASE.filter(
    (c) =>
      !c.city.toLowerCase().startsWith(q) &&
      (c.city.toLowerCase().includes(q) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        c.country.toLowerCase().includes(q))
  );

  const localMatches = [...prefixMatches, ...substringMatches];

  // Query live Open-Meteo Geocoding when user has typed at least 3 characters
  if (q.length >= 3) {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(primaryToken)}&count=10&language=en&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const remoteCities: CityLocation[] = data.results.map((r: any) => ({
            city: r.name,
            state: r.admin1 || r.admin2 || '',
            country: r.country || '',
            lat: Number(r.latitude?.toFixed(4)) || 28.6139,
            lng: Number(r.longitude?.toFixed(4)) || 77.2090,
            tzOffset: r.country === 'India' ? 5.5 : Math.round((r.longitude || 0) / 15),
          }));
          const combined = [...localMatches];
          for (const rc of remoteCities) {
            if (
              !combined.some(
                (c) =>
                  c.city.toLowerCase() === rc.city.toLowerCase() &&
                  (c.state || '').toLowerCase() === (rc.state || '').toLowerCase() &&
                  c.country.toLowerCase() === rc.country.toLowerCase()
              )
            ) {
              combined.push(rc);
            }
          }
          return combined.slice(0, 10);
        }
      }
    } catch {
      // Fallback to local matches
    }
  }

  return localMatches.slice(0, 10);
}

export const VEDIC_RASHIS = [
  'Mesh (Aries)',
  'Vrishabh (Taurus)',
  'Mithuna (Gemini)',
  'Karka (Cancer)',
  'Simha (Leo)',
  'Kanya (Virgo)',
  'Tula (Libra)',
  'Vrischika (Scorpio)',
  'Dhanu (Sagittarius)',
  'Makara (Capricorn)',
  'Kumbha (Aquarius)',
  'Meena (Pisces)',
];

export const VEDIC_NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu (7)', deity: 'Ashwini Kumaras' },
  { name: 'Bharani', lord: 'Venus (6)', deity: 'Yama' },
  { name: 'Krittika', lord: 'Sun (1)', deity: 'Agni' },
  { name: 'Rohini', lord: 'Moon (2)', deity: 'Brahma / Prajapati' },
  { name: 'Mrigashira', lord: 'Mars (9)', deity: 'Soma' },
  { name: 'Ardra', lord: 'Rahu (4)', deity: 'Rudra' },
  { name: 'Punarvasu', lord: 'Jupiter (3)', deity: 'Aditi' },
  { name: 'Pushya', lord: 'Saturn (8)', deity: 'Brihaspati' },
  { name: 'Ashlesha', lord: 'Mercury (5)', deity: 'Nagas' },
  { name: 'Magha', lord: 'Ketu (7)', deity: 'Pitris' },
  { name: 'Purva Phalguni', lord: 'Venus (6)', deity: 'Bhaga' },
  { name: 'Uttara Phalguni', lord: 'Sun (1)', deity: 'Aryaman' },
  { name: 'Hasta', lord: 'Moon (2)', deity: 'Savitar' },
  { name: 'Chitra', lord: 'Mars (9)', deity: 'Vishwakarma' },
  { name: 'Swati', lord: 'Rahu (4)', deity: 'Vayu' },
  { name: 'Vishakha', lord: 'Jupiter (3)', deity: 'Indra-Agni' },
  { name: 'Anuradha', lord: 'Saturn (8)', deity: 'Mitra' },
  { name: 'Jyeshtha', lord: 'Mercury (5)', deity: 'Indra' },
  { name: 'Mula', lord: 'Ketu (7)', deity: 'Nirriti' },
  { name: 'Purva Ashadha', lord: 'Venus (6)', deity: 'Apah' },
  { name: 'Uttara Ashadha', lord: 'Sun (1)', deity: 'Vishvadevas' },
  { name: 'Shravana', lord: 'Moon (2)', deity: 'Lord Vishnu' },
  { name: 'Dhanishta', lord: 'Mars (9)', deity: 'Eight Vasus' },
  { name: 'Shatabhisha', lord: 'Rahu (4)', deity: 'Varuna' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter (3)', deity: 'Aja Ekapada' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn (8)', deity: 'Ahirbudhnya' },
  { name: 'Revati', lord: 'Mercury (5)', deity: 'Pushan' },
];

/**
 * High-Precision Sidereal Sun & Moon Longitude Calculator (Meeus Chapter 47 + Chitrapaksha Lahiri Ayanamsa)
 * Takes days `d` since J2000.0 (JD 2451545.0) and returns tropical & sidereal Sun/Moon longitudes (0..360 deg).
 */
export function computeSiderealSunMoonAtDayJ2000(d: number): {
  ayanamsa: number;
  sunTropical: number;
  sunSidereal: number;
  moonTropical: number;
  moonSidereal: number;
  elongation: number;
} {
  const deg2rad = Math.PI / 180;
  const T = d / 36525.0;

  // True Chitrapaksha Lahiri Ayanamsa (23°51'25.5" at J2000.0 + 50.290966"/yr precession)
  const ayanamsa = 23.857083 + (d / 365.25) * 0.0139697;

  // Solar Mean Longitude & Mean Anomaly (Meeus Ch. 25)
  const L0 = ((280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360 + 360) % 360;
  const M_sun_deg = ((357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360 + 360) % 360;
  const M_sun = M_sun_deg * deg2rad;

  const C_sun =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_sun) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun) +
    0.000289 * Math.sin(3 * M_sun);

  const sunTropical = ((L0 + C_sun) % 360 + 360) % 360;
  const sunSidereal = ((sunTropical - ayanamsa) % 360 + 360) % 360;

  // Lunar Fundamental Arguments (Meeus Ch. 47)
  const Lp_deg =
    ((218.3165 + 481267.8813 * T - 0.0013268 * T * T) % 360 + 360) % 360;
  const D_deg =
    ((297.8502 + 445267.1115 * T - 0.00163 * T * T) % 360 + 360) % 360;
  const Mp_deg =
    ((134.9634 + 477198.8676 * T + 0.008997 * T * T) % 360 + 360) % 360;
  const F_deg =
    ((93.2721 + 483202.0175 * T - 0.0034029 * T * T) % 360 + 360) % 360;

  const D = D_deg * deg2rad;
  const M = M_sun;
  const Mp = Mp_deg * deg2rad;
  const F = F_deg * deg2rad;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  // Top 15 Periodic Terms for Moon's Ecliptic Longitude (accurate to < 2 arcminutes)
  const dL =
    6.288774 * Math.sin(Mp) +
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) -
    0.185596 * E * Math.sin(M) -
    0.114336 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057066 * E * Math.sin(2 * D - M - Mp) +
    0.053322 * Math.sin(2 * D + Mp) +
    0.045758 * E * Math.sin(2 * D - M) -
    0.040923 * E * Math.sin(Mp - M) -
    0.03472 * Math.sin(D) -
    0.030383 * E * Math.sin(Mp + M) +
    0.015327 * Math.sin(2 * D - 2 * F) -
    0.012528 * Math.sin(Mp + 2 * F) +
    0.01098 * Math.sin(Mp - 2 * F);

  const moonTropical = ((Lp_deg + dL) % 360 + 360) % 360;
  const moonSidereal = ((moonTropical - ayanamsa) % 360 + 360) % 360;
  const elongation = ((moonTropical - sunTropical) % 360 + 360) % 360;

  return {
    ayanamsa,
    sunTropical,
    sunSidereal,
    moonTropical,
    moonSidereal,
    elongation,
  };
}

/**
 * Formats a UTC timestamp (ms) into exact Indian Standard Time (IST, UTC+5:30):
 * e.g., "24 Nov 2026, 08:23 PM IST" or short "24 Nov 2026 (20:23 IST)"
 */
export function formatExactIstDateTime(
  utcMs: number,
  style: 'full' | 'compact' | 'long' | 'short' | 'short24' = 'full'
): string {
  const istMs = utcMs + 5.5 * 3600 * 1000;
  const d = new Date(istMs);
  const day = d.getUTCDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthShort = months[d.getUTCMonth()] || 'Jan';
  const monthFull = fullMonths[d.getUTCMonth()] || 'January';
  const year = d.getUTCFullYear();
  const h24 = d.getUTCHours();
  const h24Str = h24.toString().padStart(2, '0');
  const mins = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = (h24 % 12 || 12).toString().padStart(2, '0');

  if (style === 'compact') {
    return `${day} ${monthShort} ${year} (${h12}:${mins} ${ampm} IST)`;
  }
  if (style === 'short') {
    return `${day} ${monthShort} ${year}, ${h12}:${mins} ${ampm} IST`;
  }
  if (style === 'short24') {
    return `${day} ${monthShort} ${year} (${h24Str}:${mins} IST)`;
  }
  return `${day} ${monthFull} ${year}, ${h12}:${mins} ${ampm} IST`;
}

/**
 * Solves for the exact UTC timestamp (ms) near `approxUtcMs` when the Moon-Sun elongation
 * crosses `targetElongationDeg` (0..360). Each Tithi is 12 degrees of elongation:
 * - Shukla Ekadashi (11th Tithi): starts at 120°, ends at 132°
 * - Shukla Purnima (15th Tithi): starts at 168°, ends at 180°
 * - Krishna Ekadashi (26th Tithi): starts at 300°, ends at 312°
 * - Krishna Amavasya (30th Tithi): starts at 348°, ends at 0° (360°)
 */
export function solveElongationCrossingUtcMs(approxUtcMs: number, targetElongationDeg: number): number {
  const j2000UtcMs = Date.UTC(2000, 0, 1, 12, 0, 0);
  const msPerDay = 86400000;
  let d = (approxUtcMs - j2000UtcMs) / msPerDay;

  for (let iter = 0; iter < 6; iter++) {
    const { elongation } = computeSiderealSunMoonAtDayJ2000(d);
    let diff = targetElongationDeg - elongation;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    // Mean daily elongation motion is ~12.19075 deg/day
    d += diff / 12.190749;
  }

  return j2000UtcMs + d * msPerDay;
}

/**
 * Solves for the exact UTC timestamp (ms) near `approxUtcMs` when the Sidereal Sun (Nirayana Surya)
 * crosses `targetSiderealDeg` (0, 30, 60, ..., 330) — i.e., exact Surya Sankranti ingress time in IST!
 */
export function solveSiderealSunIngressUtcMs(approxUtcMs: number, targetSiderealDeg: number): number {
  const j2000UtcMs = Date.UTC(2000, 0, 1, 12, 0, 0);
  const msPerDay = 86400000;
  let d = (approxUtcMs - j2000UtcMs) / msPerDay;

  for (let iter = 0; iter < 6; iter++) {
    const { sunSidereal } = computeSiderealSunMoonAtDayJ2000(d);
    let diff = targetSiderealDeg - sunSidereal;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    // Mean daily solar sidereal motion is ~0.9856 deg/day
    d += diff / 0.98561;
  }

  return j2000UtcMs + d * msPerDay;
}

/**
 * Automatic Vedic Sidereal Ephemeris Calculator (Chitrapaksha Lahiri Ayanamsa)
 * Computes Moon Sign (Chandra Rashi), Sun Sign (Surya Rashi), Nakshatra, and Pada
 * from Date of Birth, Time of Birth, and Latitude/Longitude!
 */
export function calculateVedicAstrologyFromBirth(
  dob: string,
  tob: string = '12:00',
  lat: number = 28.6139,
  lng: number = 77.2090
): {
  rashi: string;
  rashiIndex: number;
  rashiLord: string;
  sunSign: string;
  sunSignIndex: number;
  nakshatra: string;
  nakshatraIndex: number;
  nakshatraLord: string;
  pada: number;
  moonDegreeSidereal: number;
  sunDegreeSidereal: number;
} {
  const [year, month, day] = (dob || '1990-01-01').split('-').map(Number);
  const [hour, minute] = (tob || '12:00').split(':').map(Number);

  // Convert local time to UTC using India IST (+5.5) for Indian coordinates or longitude timezone
  const tzOffset = lng >= 68 && lng <= 97.5 && lat >= 6 && lat <= 37.5 ? 5.5 : Math.round((lng / 15) * 2) / 2;
  const utcHours = (hour || 0) + (minute || 0) / 60 - tzOffset;

  // Julian Day calculation
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    utcHours / 24 +
    B -
    1524.5;

  // Days since J2000.0 (2451545.0)
  const d = jd - 2451545.0;
  const { sunSidereal, moonSidereal } = computeSiderealSunMoonAtDayJ2000(d);

  const sunSignIndex = Math.floor(sunSidereal / 30) % 12;
  const moonSignIndex = Math.floor(moonSidereal / 30) % 12;

  // 27 Nakshatras (each 13°20' = 13.33333333°)
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(moonSidereal / nakshatraSpan) % 27;
  const remainderInNakshatra = moonSidereal - nakshatraIndex * nakshatraSpan;
  const pada = Math.min(4, Math.max(1, Math.floor(remainderInNakshatra / (nakshatraSpan / 4)) + 1));

  const nakObj = VEDIC_NAKSHATRAS[nakshatraIndex] || VEDIC_NAKSHATRAS[0];
  const rashiLords = [
    'Mars (Mangal)',
    'Venus (Shukra)',
    'Mercury (Budh)',
    'Moon (Chandra)',
    'Sun (Surya)',
    'Mercury (Budh)',
    'Venus (Shukra)',
    'Mars (Mangal)',
    'Jupiter (Guru)',
    'Saturn (Shani)',
    'Saturn (Shani)',
    'Jupiter (Guru)',
  ];

  return {
    rashi: VEDIC_RASHIS[moonSignIndex],
    rashiIndex: moonSignIndex,
    rashiLord: rashiLords[moonSignIndex] || 'Sun (Surya)',
    sunSign: VEDIC_RASHIS[sunSignIndex],
    sunSignIndex,
    nakshatra: nakObj.name,
    nakshatraIndex,
    nakshatraLord: nakObj.lord,
    pada,
    moonDegreeSidereal: Number(moonSidereal.toFixed(2)),
    sunDegreeSidereal: Number(sunSidereal.toFixed(2)),
  };
}

/**
 * Calculate 7 Chakra Marital Challenges & Fortune Reading + Aura Scan Remedies for Partner Milan
 */
export function calculatePartnerChakraChallenges(
  m1: number,
  b1: number,
  n1: number,
  m2: number,
  b2: number,
  n2: number,
  groomName: string = 'Groom',
  brideName: string = 'Bride',
  groomRashi: string = 'Kanya (Virgo)',
  brideRashi: string = 'Vrishabh (Taurus)'
): ChakraMaritalChallenge[] {
  const relMulank = getPlanetaryRelationship(m1, m2);
  const relBhagyank = getPlanetaryRelationship(b1, b2);
  const relNamank = getPlanetaryRelationship(n1, n2);

  const p1Planet = PLANETARY_PROFILES[m1]?.planet || 'Sun';
  const p2Planet = PLANETARY_PROFILES[m2]?.planet || 'Moon';

  const hasSaturnClash = [m1, b1, m2, b2].includes(8) && ([m1, b1, m2, b2].includes(1) || [m1, b1, m2, b2].includes(2) || [m1, b1, m2, b2].includes(9));
  const hasRahuKetuClash = [m1, b1, m2, b2].includes(4) || [m1, b1, m2, b2].includes(7);
  const hasMarsFire = [m1, m2].includes(9) || [m1, m2].includes(1);
  const hasMoonSensitivity = [m1, m2].includes(2) || [b1, b2].includes(2);

  const groomHasEarthStress = [4, 8, 7].includes(b1) || [4, 8].includes(m1);
  const brideHasEarthStress = [4, 8, 7].includes(b2) || [4, 8].includes(m2);

  const rawList: ChakraMaritalChallenge[] = [
    {
      chakraName: 'Root Chakra (Security, Finances & In-Law Stability)',
      sanskritName: 'Muladhara Chakra (मूलाधार)',
      element: 'Earth (Prithvi)',
      color: '#EF4444',
      alignmentScore: hasSaturnClash ? 52 : relBhagyank === 'friendly' ? 90 : 74,
      status: hasSaturnClash ? 'Severe Karmic Challenge' : relBhagyank === 'friendly' ? 'Harmonious' : 'Moderate Blockage',
      affectedPartner:
        groomHasEarthStress && !brideHasEarthStress
          ? `Primary Carrier: Groom (${groomName})`
          : !groomHasEarthStress && brideHasEarthStress
          ? `Primary Carrier: Bride (${brideName})`
          : `Joint Carrier: Groom (${groomName}) & Bride (${brideName})`,
      groomChallengeDetail: `Groom (${groomName} — Mulank ${m1}, Bhagyank ${b1}): Experiences pressure to prove financial stability, work-life exhaustion, and feeling caught between parental expectations and marital responsibilities.`,
      brideChallengeDetail: `Bride (${brideName} — Mulank ${m2}, Bhagyank ${b2}): Experiences initial domestic adjustment stress, unspoken expectations from in-laws, or anxiety regarding joint savings and home ownership.`,
      postMarriageIssue: hasSaturnClash
        ? 'Post-marriage financial fluctuations, delays in buying joint property, or interference from extended family & in-laws due to Saturn-Sun/Mars karmic friction.'
        : 'Occasional anxiety regarding long-term savings, career relocation, or balancing parental responsibilities after marriage.',
      fortuneReadingDiagnosis: `Destiny axis (${b1} & ${b2}) between ${groomRashi} and ${brideRashi} carries ${hasSaturnClash ? 'Prarabdha Saturn-Agni karmic load' : 'grounded earthly progression'}.`,
      auraScanRemedy: 'Perform Himalayan Rock Salt + Alum (Fitkari) foot soak together on Saturdays for 15 minutes to drain lower-astral root blockages. Place a Red Jasper & Gomti Chakra pair in the South-West corner of the master bedroom.',
      groomRemedy: `Groom (${groomName}): Wear a 7-Mukhi Rudraksha or Black Tourmaline bracelet on the right wrist, offer sesame oil at a Shani temple on Saturdays, and avoid lending money on Tuesdays/Saturdays.`,
      brideRemedy: `Bride (${brideName}): Place 2 Gomti Chakras and a piece of Red Jasper wrapped in red silk inside the household cash locker on Friday morning and light a ghee lamp in the South-East.`,
      bothRemedy: `Both (${groomName} & ${brideName}): Perform a 15-minute Himalayan Pink Salt foot soak together on Saturday evenings and keep the South-West master bedroom corner heavy and clutter-free.`,
      healingCrystal: 'Red Jasper / Black Tourmaline (396 Hz)',
      beejMantra: 'Om Lam Namah (Chant 27 times facing South-West)',
      soundFrequencyHz: '396 Hz & 174 Hz (Root Grounding & Fear Liberation)',
    },
    {
      chakraName: 'Sacral Chakra (Intimacy, Romance & Progeny / Childbirth)',
      sanskritName: 'Svadhisthana Chakra (स्वाधिष्ठान)',
      element: 'Water (Jala)',
      color: '#F97316',
      alignmentScore: hasMoonSensitivity && hasSaturnClash ? 55 : [6, 2, 5].includes(m1) || [6, 2, 5].includes(m2) ? 88 : 72,
      status: hasMoonSensitivity && hasSaturnClash ? 'Severe Karmic Challenge' : 'Harmonious',
      affectedPartner:
        [2, 7, 8].includes(m2)
          ? `Primary Carrier: Bride (${brideName})`
          : [2, 7, 8].includes(m1)
          ? `Primary Carrier: Groom (${groomName})`
          : `Mutual Resonance (${groomName} & ${brideName})`,
      groomChallengeDetail: `Groom (${groomName}): Tendency to become overly practical or emotionally distant during high-pressure career phases, reducing romantic spontaneity.`,
      brideChallengeDetail: `Bride (${brideName}): Heightened lunar sensitivity (${brideRashi}), mood fluctuations during waxing/waning moon cycles, or feeling emotionally unheard during intimate moments.`,
      postMarriageIssue:
        hasMoonSensitivity && hasSaturnClash
          ? 'Emotional mood swings, Vish-Yoga emotional withdrawal in intimacy, creative dryness, or hormonal/progeny delays after 2 years of marriage.'
          : 'Temporary dips in romantic spontaneity when career pressure mounts.',
      fortuneReadingDiagnosis: `Water-Venusian bio-field between Mulank ${m1} (${p1Planet}) and Mulank ${m2} (${p2Planet}) shows ${hasMoonSensitivity ? 'high lunar psychic receptivity requiring emotional shielding' : 'healthy sensual resonance'}.`,
      auraScanRemedy: 'Keep a Silver bowl with fresh water and rose petals in the bedroom North-East. Drink water stored in a silver vessel, wear natural Carnelian or Pearl, and play 417 Hz & 210.42 Hz Sacral-Lunar sound frequencies.',
      groomRemedy: `Groom (${groomName}): Offer white sandalwood and raw milk on a Shivalinga on Mondays, gift white flowers or natural rose attar to your spouse on Fridays, and unwind to 417 Hz sound therapy.`,
      brideRemedy: `Bride (${brideName}): Drink water from a pure silver glass daily, wear a Moonstone or Carnelian crystal bracelet on the left wrist, and listen to 417 Hz & 210.42 Hz Lunar Crystal Bowl resonance.`,
      bothRemedy: `Both (${groomName} & ${brideName}): Keep a silver or glass bowl filled with fresh water and fresh rose petals in the North-East corner of the bedroom and play 417 Hz Sacral harmony frequencies for 15 mins before sleep.`,
      healingCrystal: 'Carnelian / Moonstone (417 Hz)',
      beejMantra: 'Om Vam Namah (Chant 21 times on Fridays)',
      soundFrequencyHz: '417 Hz & 210.42 Hz (Sacral Intimacy & Lunar Flow)',
    },
    {
      chakraName: 'Solar Plexus Chakra (Ego Clashes, Dominance & Anger)',
      sanskritName: 'Manipura Chakra (मणिपूर)',
      element: 'Fire (Agni)',
      color: '#EAB308',
      alignmentScore: hasMarsFire && relMulank === 'inimical' ? 48 : hasMarsFire ? 65 : 86,
      status: hasMarsFire && relMulank === 'inimical' ? 'Severe Karmic Challenge' : hasMarsFire ? 'Moderate Blockage' : 'Harmonious',
      affectedPartner:
        [1, 9, 3].includes(m1) && ![1, 9].includes(m2)
          ? `Primary Trigger: Groom (${groomName} — Agni Dominance)`
          : [1, 9, 3].includes(m2) && ![1, 9].includes(m1)
          ? `Primary Trigger: Bride (${brideName} — Agni Dominance)`
          : `Both Groom & Bride (Dual Willpower Axis)`,
      groomChallengeDetail: `Groom (${groomName}): Governed by ${p1Planet} (${m1}), exhibits strong executive pride, dislike of being corrected in front of family, and sudden fiery temper when authority is questioned.`,
      brideChallengeDetail: `Bride (${brideName}): Governed by ${p2Planet} (${m2}), resists unilateral decisions, leading to silent resistance or sharp counter-arguments if her autonomy is overlooked.`,
      postMarriageIssue:
        hasMarsFire
          ? 'High fire element (Agni Tattva) triggers sudden ego clashes, "who has the final word" power struggles, impulsive anger, and digestive/acidity stress in married life.'
          : 'Subtle stubbornness when making major household decisions.',
      fortuneReadingDiagnosis: `Solar Plexus scan detects ${hasMarsFire ? 'excessive Martian/Solar heat in the couple’s combined bio-field' : 'balanced executive willpower'}.`,
      auraScanRemedy: 'Never place kitchen fire or red lights in the bedroom. Perform Camphor + Clove aura cleansing every Tuesday evening, keep a Natural Citrine cluster on the dining table, and play 528 Hz & 126.22 Hz Solar-Peace sound frequencies.',
      groomRemedy: `Groom (${groomName}): Apply a cooling White Chandan (Sandalwood) tilak every morning, recite Hanuman Chalisa on Tuesdays, and listen to 528 Hz Solfeggio chimes to pacify excess Pitta.`,
      brideRemedy: `Bride (${brideName}): Light a Bhimseni Camphor (Kapoor) with 2 cloves in a brass diffuser on Tuesday and Friday evenings while playing 528 Hz & 432 Hz sound frequencies.`,
      bothRemedy: `Both (${groomName} & ${brideName}): Never discuss contentious financial or in-law matters after 10:00 PM; keep a Natural Citrine crystal on the dining table and play 528 Hz Miracle Transformation tones during dinner.`,
      healingCrystal: 'Natural Citrine / Yellow Tiger Eye (528 Hz)',
      beejMantra: 'Om Ram Namah (Chant 11 times before tough discussions)',
      soundFrequencyHz: '528 Hz & 126.22 Hz (Solar Plexus Peace & Ego Balance)',
    },
    {
      chakraName: 'Heart Chakra (Unconditional Love, Trust & Forgiveness)',
      sanskritName: 'Anahata Chakra (अनाहत)',
      element: 'Air (Vayu)',
      color: '#10B981',
      alignmentScore: relMulank === 'friendly' ? 94 : relMulank === 'neutral' ? 78 : 56,
      status: relMulank === 'friendly' ? 'Harmonious' : relMulank === 'neutral' ? 'Moderate Blockage' : 'Severe Karmic Challenge',
      affectedPartner:
        relMulank === 'inimical'
          ? `Mutual Planetary Friction (${groomName} & ${brideName})`
          : `Bride (${brideName}) & Groom (${groomName}) Emotional Cord`,
      groomChallengeDetail: `Groom (${groomName}): Expresses love through material provision and duty rather than frequent verbal vulnerability, which can be misread as emotional aloofness.`,
      brideChallengeDetail: `Bride (${brideName}): Deeply craves emotional reassurance and quality presence; tends to store unspoken hurt in the Anahata heart center if past misunderstandings are not resolved.`,
      postMarriageIssue:
        relMulank === 'inimical'
          ? 'Holding onto past grudges, feeling emotionally unappreciated by the spouse, or unspoken resentment accumulating over small domestic misunderstandings.'
          : 'Deep soul affection, though occasional need for verbal reassurance.',
      fortuneReadingDiagnosis: `Anahata scan shows ${relMulank === 'inimical' ? 'planetary friction between ruling deities creating a defensive heart shield' : 'expanded emerald-pink aura cords of devotion'}.`,
      auraScanRemedy: 'Place a pair of bonded Rose Quartz Mandarin Ducks or Twin Hearts in the South-West bedroom corner, apply pure Rose Attar on Fridays, and play 639 Hz & 221.23 Hz Anahata Heart-Opening sound frequencies.',
      groomRemedy: `Groom (${groomName}): Wear a 6-Mukhi Rudraksha or Green Aventurine bracelet, and dedicate 15 minutes of device-free conversation with ${brideName} every evening with soft 639 Hz chimes.`,
      brideRemedy: `Bride (${brideName}): Wear a natural Rose Quartz pendant or bracelet near the heart pulse point and meditate with 639 Hz & 221.23 Hz Rose Quartz bowl resonance on Fridays.`,
      bothRemedy: `Both (${groomName} & ${brideName}): Place a pair of carved Rose Quartz Twin Hearts in the South-West corner of the bedroom and listen together to 639 Hz Heart-Chakra Solfeggio audio on Friday evenings.`,
      healingCrystal: 'Rose Quartz & Green Aventurine (639 Hz)',
      beejMantra: 'Om Yam Namah (Chant together on Friday mornings)',
      soundFrequencyHz: '639 Hz & 221.23 Hz (Anahata Heart & Forgiveness)',
    },
    {
      chakraName: 'Throat Chakra (Communication, Truth & Misunderstandings)',
      sanskritName: 'Vishuddha Chakra (विशुद्ध)',
      element: 'Ether (Akasha)',
      color: '#38BDF8',
      alignmentScore: relNamank === 'inimical' ? 54 : [5, 3].includes(m1) || [5, 3].includes(m2) ? 92 : 76,
      status: relNamank === 'inimical' ? 'Severe Karmic Challenge' : 'Harmonious',
      affectedPartner:
        n1 === 8 || n1 === 4
          ? `Primary Carrier: Groom (${groomName} — Namank ${n1})`
          : n2 === 8 || n2 === 4
          ? `Primary Carrier: Bride (${brideName} — Namank ${n2})`
          : `Vocal Resonance Between ${groomName} & ${brideName}`,
      groomChallengeDetail: `Groom (${groomName} — Namank ${n1}): Direct, blunt, or terse communication style during disagreements that can sound harsher than intended.`,
      brideChallengeDetail: `Bride (${brideName} — Namank ${n2}): May resort to silent withdrawal when hurt, or feel her perspective is interrupted during family discussions.`,
      postMarriageIssue:
        relNamank === 'inimical'
          ? 'Harsh tone of voice during arguments, silent treatment, or words being misinterpreted by the partner and relatives.'
          : 'Generally clear dialogue; must guard against over-analyzing trivial remarks.',
      fortuneReadingDiagnosis: `Chaldean Sound Vibration between Namank ${n1} and ${n2} indicates ${relNamank === 'inimical' ? 'acoustic dissonance in spoken frequencies' : 'harmonious vocal resonance'}.`,
      auraScanRemedy: 'Harmonize your post-marriage name spelling using the Name Resonance table. Gargle with warm turmeric-salted water, wear a 5-Mukhi Rudraksha or Blue Lace Agate, and play 741 Hz & 141.27 Hz Vishuddha Vocal sound frequencies.',
      groomRemedy: `Groom (${groomName}): Adopt your harmonized Chaldean name spelling on social/professional profiles and chant "Om Bum Budhaya Namah" 11 times with 741 Hz & 141.27 Hz Mercury chimes.`,
      brideRemedy: `Bride (${brideName}): Wear a Blue Lace Agate or Aquamarine throat crystal, nurture a green Tulsi plant in the North-East balcony, and listen to 741 Hz Throat-Expression frequencies.`,
      bothRemedy: `Both (${groomName} & ${brideName}): Harmonize your combined marital surname vibration and practice 5 minutes of Bhramari Pranayama (humming bee breath at 741 Hz resonance) together.`,
      healingCrystal: 'Lapis Lazuli / Blue Lace Agate (741 Hz)',
      beejMantra: 'Om Ham Namah (Chant 21 times on Wednesdays)',
      soundFrequencyHz: '741 Hz & 141.27 Hz (Vishuddha Vocal Harmony)',
    },
    {
      chakraName: 'Third Eye Chakra (Intuition, Suspicion & Mental Peace)',
      sanskritName: 'Ajna Chakra (आज्ञा)',
      element: 'Light / Maha Tattva',
      color: '#6366F1',
      alignmentScore: hasRahuKetuClash ? 58 : 88,
      status: hasRahuKetuClash ? 'Moderate Blockage' : 'Harmonious',
      affectedPartner:
        [4, 7].includes(m1) || [4, 7].includes(b1)
          ? `Primary Carrier: Groom (${groomName} — Nodal Influence)`
          : [4, 7].includes(m2) || [4, 7].includes(b2)
          ? `Primary Carrier: Bride (${brideName} — Nodal Influence)`
          : `Shared Mental Plane (${groomName} & ${brideName})`,
      groomChallengeDetail: `Groom (${groomName}): Over-analyzing future financial risks, insomnia during high-stakes business transitions, or skepticism toward intuitive advice.`,
      brideChallengeDetail: `Bride (${brideName}): Intuitive sixth sense is extremely sharp; if transparency is lacking, Rahu-Ketu nodal energy can trigger overthinking or imaginary doubts.`,
      postMarriageIssue:
        hasRahuKetuClash
          ? 'Overthinking, unnecessary suspicion/illusions (Rahu fog), disturbed sleep cycles, or differing visions for future investments.'
          : 'Strong shared foresight and intuitive telepathy between partners.',
      fortuneReadingDiagnosis: `Ajna scan detects ${hasRahuKetuClash ? 'Rahu-Ketu nodal shadow causing periodic mental restlessness' : 'clear psychic alignment'}.`,
      auraScanRemedy: 'Apply White Sandalwood (Chandan) or Kesar tilak on the Third Eye daily, burn pure Guggal/Loban dhoop at sunset, and play 852 Hz & 207.36 Hz Ajna Clarity sound frequencies.',
      groomRemedy: `Groom (${groomName}): Apply Saffron (Kesar) tilak between the eyebrows each morning, feed seven-grain Satnaja to birds, and listen to 852 Hz Third-Eye awakening tones.`,
      brideRemedy: `Bride (${brideName}): Keep a natural Amethyst cluster on the bedside table, avoid sleeping with mobile phones near the head, and unwind with 852 Hz & 432 Hz binaural chimes.`,
      bothRemedy: `Both (${groomName} & ${brideName}): Burn natural Guggal and Loban dhoop at sunset with 852 Hz Tibetan Singing Bowl audio to dispel Rahu-Ketu mental fog.`,
      healingCrystal: 'Amethyst / Lapis Lazuli (852 Hz)',
      beejMantra: 'Om Aum Namah (5 minutes Trataka candle meditation)',
      soundFrequencyHz: '852 Hz & 207.36 Hz (Ajna Intuition & Mental Peace)',
    },
    {
      chakraName: 'Crown Chakra (Karmic Destiny, Ancestral Pitru Grace & Dharma)',
      sanskritName: 'Sahasrara Chakra (सहस्रार)',
      element: 'Cosmic Consciousness',
      color: '#A855F7',
      alignmentScore: (m1 + m2 + b1 + b2) % 3 === 0 ? 95 : 82,
      status: 'Harmonious',
      affectedPartner: `Ancestral Lineage of Groom (${groomName}) & Bride (${brideName})`,
      groomChallengeDetail: `Groom (${groomName}): Carries the responsibility of fulfilling ancestral (Pitru/Kuldevta) traditions and maintaining dharmic ethics in business.`,
      brideChallengeDetail: `Bride (${brideName}): Acts as the Griha-Lakshmi conduit; when her spiritual peace is honored, the entire household’s Sahasrara prosperity multiplies.`,
      postMarriageIssue:
        'Disconnection from spiritual routine when overly consumed by material deadlines, or unfulfilled ancestral (Kuldevi/Kuldevta) vows.',
      fortuneReadingDiagnosis: 'Sahasrara Crown scan confirms this union has a higher spiritual contract for mutual soul evolution and family upliftment.',
      auraScanRemedy: 'Visit your Kuldevi/Kuldevta temple together once a year after marriage, offer water to the rising Sun, donate food on Amavasya, and play 963 Hz & 136.10 Hz Sahasrara Cosmic Om sound frequencies.',
      groomRemedy: `Groom (${groomName}): Offer Pitru Tarpan / charity of food on Amavasya, offer Arghya to Lord Surya every morning, and meditate with 963 Hz & 136.10 Hz Om frequencies.`,
      brideRemedy: `Bride (${brideName}): Light a pure cow-ghee lamp at the home temple during Pradosh Kaal and play 963 Hz Crown-Lotus & 183.58 Hz Guru frequencies on Thursdays.`,
      bothRemedy: `Both (${groomName} & ${brideName}): Visit your family Kuldevi / Kuldevta shrine together annually and play 963 Hz + 136.10 Hz Divine Consciousness sound frequencies during family prayers.`,
      healingCrystal: 'Clear Quartz / Selenite Wand (963 Hz)',
      beejMantra: 'Om Namah Shivaya / Gayatri Mantra',
      soundFrequencyHz: '963 Hz & 136.10 Hz (Sahasrara Crown & Ancestral Grace)',
    },
  ];

  return rawList.map((item) => ({
    ...item,
    primaryCarrierName: item.affectedPartner,
  }));
}

/**
 * Career, Business & Work Field Suitability + Fortune Reading & Aura Scan Remedies
 * Based on Name (Namank) and Date of Birth (Mulank & Bhagyank)
 */
export function calculateCareerAndAuraProfile(
  name: string,
  mulank: number,
  bhagyank: number,
  namank: number
): CareerAndAuraProfile {
  const mPlanet = PLANETARY_PROFILES[mulank] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[bhagyank] || PLANETARY_PROFILES[1];

  const businessDatabase: Record<
    number,
    {
      perfect: { field: string; reason: string; successRate: number }[];
      professions: string[];
      veryBad: { field: string; dangerReason: string; conflictPlanet: string }[];
      auraColor: string;
      primaryChakra: string;
    }
  > = {
    1: {
      perfect: [
        { field: 'Government Contracts, Civil Administration & Politics', reason: 'Sun (Surya) grants sovereign authority, state favor, and leadership command.', successRate: 96 },
        { field: 'Solar Energy, Power, Gold/Copper Bullion & Luxury Jewellery', reason: 'Direct elemental resonance with Surya’s Agni and Gold vibration.', successRate: 94 },
        { field: 'CEO / Founder of Tech, Pharmaceuticals, or Surgical Healthcare', reason: 'Sun governs vitality, medicine, and top-tier executive decision-making.', successRate: 92 },
      ],
      professions: ['IAS/IPS/Civil Services', 'Corporate CEO/Director', 'Cardiologist / Surgeon', 'Renewable Energy Entrepreneur', 'High-Profile Brand Consultant'],
      veryBad: [
        { field: 'Scrap Iron, Used Machinery, Coal Mining & Leather Trade', dangerReason: 'Governed by Saturn (8) — bitter enemy of Sun (1). Causes severe legal battles, labor strikes, and capital blockage.', conflictPlanet: 'Saturn (8)' },
        { field: 'Subordinate Clerical Roles or Silent Back-Office Partnerships', dangerReason: 'Suppresses Solar leadership aura, leading to ego humiliation and career stagnation.', conflictPlanet: 'Saturn / Rahu' },
      ],
      auraColor: 'Radiant Golden-Ruby Solar Aura',
      primaryChakra: 'Manipura (Solar Plexus) & Sahasrara (Crown)',
    },
    2: {
      perfect: [
        { field: 'Hospitality, Dairy, Beverages, Mineral Water & Marine Import-Export', reason: 'Moon (Chandra) rules liquids, nourishment, travel across waters, and public care.', successRate: 95 },
        { field: 'Healing, Psychology, Holistic Wellness, Silver & Pearl Jewellery', reason: 'Chandra grants unmatched empathy, emotional healing, and soothing aesthetics.', successRate: 93 },
        { field: 'Creative Arts, Interior Design, Film Production & Perfumery', reason: 'Imaginative fertility of Moon attracts mass public admiration.', successRate: 90 },
      ],
      professions: ['Psychologist / Healer', 'Hotel & Resort Owner', 'Marine / Export Merchant', 'Creative Director / Designer', 'Pediatrician / Care Specialist'],
      veryBad: [
        { field: 'Heavy Iron Smelting, Weapons, Explosives & High-Stress Debt Recovery', dangerReason: 'Harsh Saturn (8) and Rahu (4) vibrations shatter Moon’s delicate mental peace, triggering Vish-Yoga anxiety and financial betrayal.', conflictPlanet: 'Saturn (8) & Rahu (4)' },
        { field: 'Intraday High-Leverage Crypto / Speculative Gambling', dangerReason: 'Emotional fluctuations during waning moon phases cause impulsive losses.', conflictPlanet: 'Rahu (4)' },
      ],
      auraColor: 'Luminous Silver-Pearl Opalescent Aura',
      primaryChakra: 'Svadhisthana (Sacral) & Ajna (Third Eye)',
    },
    3: {
      perfect: [
        { field: 'Education, EdTech, Coaching Institutes, Universities & Publishing', reason: 'Jupiter (Guru) is the supreme cosmic teacher, blessing knowledge enterprises with immense respect.', successRate: 97 },
        { field: 'Banking, Wealth Management, Judiciary, Law Firms & Advisory', reason: 'Brihaspati governs treasury (Dhana Karaka), dharma, and ethical counsel.', successRate: 95 },
        { field: 'Spiritual Wellness, Temple/Religious Goods, Saffron & Organic Foods', reason: 'Pure Sattvic alignment multiplies generational goodwill and fortune.', successRate: 92 },
      ],
      professions: ['Judge / Senior Advocate', 'Chartered Accountant / Investment Banker', 'University Dean / EdTech Founder', 'Spiritual Mentor / Astrologer', 'Management Strategist'],
      veryBad: [
        { field: 'Liquor, Tobacco, Nightclubs, Meat Processing & Casino/Betting', dangerReason: 'Violates Jupiter’s Sattvic Guru Tatva; immediately destroys family peace, reputation, and invites liver/health crises.', conflictPlanet: 'Rahu (4) & Venus (Asura)' },
        { field: 'Unethical Quick-Money Schemes or Illicit Brokerage', dangerReason: 'Triggers Guru Chandal Dosha, wiping out accumulated wealth.', conflictPlanet: 'Rahu (4)' },
      ],
      auraColor: 'Sacred Golden-Saffron Brihaspati Aura',
      primaryChakra: 'Vishuddha (Throat) & Sahasrara (Crown)',
    },
    4: {
      perfect: [
        { field: 'Software Engineering, AI, Cybersecurity, Aviation & Space Tech', reason: 'Rahu rules sudden futuristic innovations, digital networks, and airwaves.', successRate: 95 },
        { field: 'Digital Media, Viral Marketing, Cinema, Photography & Electronics', reason: 'Rahu commands mass illusion, screens, and rapid global reach.', successRate: 93 },
        { field: 'Import-Export, Foreign Logistics, Custom Clearance & Diagnostics', reason: 'Thrives in cross-border, unconventional, and complex technical problem-solving.', successRate: 90 },
      ],
      professions: ['AI / Software Architect', 'Aviation / Telecom Engineer', 'Digital Marketing Mogul', 'Radiologist / Diagnostic Specialist', 'Political Strategist'],
      veryBad: [
        { field: 'Traditional Joint-Family Cash Lending without Written Contracts', dangerReason: 'Rahu’s shadow energy causes sudden misunderstandings and unrecoverable bad debts when agreements are informal.', conflictPlanet: 'Moon (2) & Sun (1)' },
        { field: 'Slow-Moving Agricultural Commodities with Thin Margins', dangerReason: 'Causes restlessness and sudden regulatory hurdles.', conflictPlanet: 'Mars (9)' },
      ],
      auraColor: 'Electric Indigo & Smoky Neon Aura',
      primaryChakra: 'Ajna (Third Eye) & Muladhara (Root)',
    },
    5: {
      perfect: [
        { field: 'Stock Market, FinTech, Trading, E-Commerce & Commercial Brokerage', reason: 'Mercury (Budha) is the prince of commerce, speed, calculation, and liquidity.', successRate: 98 },
        { field: 'Telecommunications, IT Consulting, Media, PR & International Trade', reason: 'Budha rules communication networks, negotiation, and multi-channel business.', successRate: 95 },
        { field: 'Chartered Accountancy, Logistics, Chartered Agencies & Retail Chains', reason: 'High cash-flow velocity and universal planetary friendship (Mitra with all).', successRate: 94 },
      ],
      professions: ['FinTech / E-Commerce Founder', 'Stock & Forex Fund Manager', 'International Trade Baron', 'CA / Financial Auditor', 'Media & PR Diplomat'],
      veryBad: [
        { field: 'Monotonous Heavy Manufacturing with Long 5-Year Lock-In Cycles', dangerReason: 'Mercury thrives on speed and liquidity; locking all capital in illiquid heavy factories drains mental vitality.', conflictPlanet: 'Saturn (8)' },
        { field: 'Isolated Manual Labor with Zero Client Interaction', dangerReason: 'Blocks Budha’s vocal and commercial genius.', conflictPlanet: 'Ketu (7)' },
      ],
      auraColor: 'Vibrant Emerald-Jade Mercurial Aura',
      primaryChakra: 'Vishuddha (Throat) & Manipura (Solar Plexus)',
    },
    6: {
      perfect: [
        { field: 'Luxury Fashion, Cosmetics, Diamonds/Jewellery, Perfumes & Lifestyle', reason: 'Venus (Shukra) rules glamour, beauty, opulence, and magnetic attraction.', successRate: 97 },
        { field: 'Five-Star Hotels, Fine Dining, Wedding Planning, Cinema & Music', reason: 'Shukra blesses entertainment, celebration, and high-margin luxury hospitality.', successRate: 95 },
        { field: 'Luxury Automobiles, Interior Architecture & Aesthetic Clinics', reason: 'Attracts affluent clientele and repeat premium referrals effortlessly.', successRate: 93 },
      ],
      professions: ['Luxury Brand Founder', 'Celebrity Architect / Interior Designer', 'Cosmetic Dermatologist', 'Film / Music Producer', 'Hospitality & Event Mogul'],
      veryBad: [
        { field: 'Scrap Metal, Coal, Cremation/Mortuary Services & Harsh Chemical Plants', dangerReason: 'Dull,polluted environments extinguish Venus’s Lakshmi grace, leading to cash-flow drought and health decline.', conflictPlanet: 'Saturn / Ketu' },
        { field: 'Aggressive Litigation / Conflict-Heavy Debt Collection', dangerReason: 'Destroys the peace and charm required for Shukra’s prosperity.', conflictPlanet: 'Mars (9)' },
      ],
      auraColor: 'Iridescent Diamond-Pink & Opal Aura',
      primaryChakra: 'Anahata (Heart) & Svadhisthana (Sacral)',
    },
    7: {
      perfect: [
        { field: 'Occult Sciences, Astrology, Fortune Reading, Aura Healing & Yoga', reason: 'Ketu is the supreme Moksha-karaka, granting clairvoyant intuition and healing siddhi.', successRate: 98 },
        { field: 'Deep R&D, Data Science, Pharmaceuticals, Cybersecurity & Forensics', reason: 'Ketu pierces to the root of hidden mysteries and microscopic research.', successRate: 94 },
        { field: 'Export of Herbs, Spiritual Tourism, Writing & Niche Consulting', reason: 'Thrives as an independent authority rather than a conventional crowd follower.', successRate: 91 },
      ],
      professions: ['Master Astrologer / Energy Healer', 'Research Scientist / Data Architect', 'Forensic / Cybersecurity Expert', 'Philosopher / Author', 'Alternative Medicine Specialist'],
      veryBad: [
        { field: 'Noisy Mass-Market Retail or Multi-Partner Political Ventures', dangerReason: 'Ketu detests superficial politics and noisy crowds; blind partnerships lead to sudden betrayal.', conflictPlanet: 'Mars / Mercury' },
        { field: 'High-Debt Real Estate Speculation', dangerReason: 'Ketu is detached from material hoarding; over-leveraging invites sudden write-offs.', conflictPlanet: 'Saturn (8)' },
      ],
      auraColor: 'Mystic Violet-Gold & Smoky Quartz Aura',
      primaryChakra: 'Sahasrara (Crown) & Ajna (Third Eye)',
    },
    8: {
      perfect: [
        { field: 'Real Estate, Infrastructure, Construction, Mining, Steel & Manufacturing', reason: 'Saturn (Shani) is the undisputed lord of land (Bhumi), iron, machinery, and monumental scale.', successRate: 96 },
        { field: 'Judiciary, Corporate Law, Insurance, Oil/Gas & Heavy Logistics', reason: 'Shani rewards long-term endurance, compliance, and structured empires.', successRate: 94 },
        { field: 'Agriculture, Warehousing, Mass Employment Enterprises & Finance', reason: 'Generates massive compounding wealth after age 32–36 through karmic justice.', successRate: 92 },
      ],
      professions: ['Real Estate / Infrastructure Developer', 'Supreme/High Court Advocate', 'Industrialist / Factory Owner', 'Insurance & Pension Fund Head', 'Mining & Energy Executive'],
      veryBad: [
        { field: 'Get-Rich-Quick Day Trading, Lottery, or Impulsive Short-Term Flips', dangerReason: 'Shani punishes shortcuts severely; speculative gambling results in instant karmic wipeout.', conflictPlanet: 'Rahu / Sun' },
        { field: 'Unethical Labor Exploitation or Tax Evasion', dangerReason: 'Saturn is the Supreme Judge (Dharmaraj); any injustice to workers triggers immediate downfall.', conflictPlanet: 'Sun (1)' },
      ],
      auraColor: 'Deep Sapphire-Indigo Karmic Shield Aura',
      primaryChakra: 'Muladhara (Root) & Ajna (Third Eye)',
    },
    9: {
      perfect: [
        { field: 'Defense, Police, Security Agencies, Sports, Fitness & Martial Arts', reason: 'Mars (Mangal) is the celestial commander-in-chief, ruling courage, stamina, and protection.', successRate: 97 },
        { field: 'Real Estate Development, Land Dealing, Civil Engineering & Construction', reason: 'Mangal is Bhumi-Putra (Son of Earth), granting extraordinary profits from land and property.', successRate: 95 },
        { field: 'Surgery, Pharmaceuticals, Fire/Electrical Engineering & High-End Restaurants', reason: 'Masters fire, surgical precision, and high-energy execution.', successRate: 93 },
      ],
      professions: ['Real Estate / Land Magnate', 'Defense / Police Commander', 'Orthopedic / Trauma Surgeon', 'Sports / Fitness Brand Founder', 'Civil & Structural Engineer'],
      veryBad: [
        { field: 'Slow, Passive, Micro-Managed Clerical Jobs with Indecisive Bosses', dangerReason: 'Frustrates Martian warrior vitality, causing explosive arguments and abrupt resignations.', conflictPlanet: 'Saturn (8) & Rahu (4)' },
        { field: 'Delicate Sentiment-Driven Partnerships with Overly Timid Associates', dangerReason: 'Pace mismatch leads to friction.', conflictPlanet: 'Moon (2)' },
      ],
      auraColor: 'Fiery Crimson-Coral Warrior Aura',
      primaryChakra: 'Manipura (Solar Plexus) & Muladhara (Root)',
    },
  };

  const mData = businessDatabase[mulank] || businessDatabase[1];
  const bData = businessDatabase[bhagyank] || businessDatabase[5];

  // Combine top perfect businesses from Mulank and Bhagyank
  const perfectBusinesses = [
    ...mData.perfect.map((p) => ({ ...p, governingPlanet: `${mPlanet.planet} (Mulank ${mulank})` })),
    ...bData.perfect
      .filter((bp) => !mData.perfect.some((mp) => mp.field === bp.field))
      .slice(0, 2)
      .map((p) => ({ ...p, governingPlanet: `${bPlanet.planet} (Bhagyank ${bhagyank})` })),
  ];

  const favorableProfessions = Array.from(new Set([...mData.professions, ...bData.professions]));

  const veryBadBusinesses = [
    ...mData.veryBad,
    ...bData.veryBad.filter((bv) => !mData.veryBad.some((mv) => mv.field === bv.field)),
  ];

  const fortuneReadingRemedies: CareerAndAuraProfile['fortuneReadingRemedies'] = [
    {
      title: '7-Chakra & Bio-Field Aura Salt Cleansing',
      category: 'Aura Scan Cleansing',
      issueAddressed: 'Removes psychic debris, evil eye (Nazar Dosha), and stagnant business blockages.',
      prescription: `Every Thursday & Saturday morning, bathe with a pinch of Himalayan Pink Salt + 2 drops of Lavender/Sandalwood essential oil while listening to 396 Hz & 528 Hz Solfeggio frequencies. Visualize a ${mData.auraColor} expanding 3 feet around your body.`,
      frequencyHz: '396 Hz & 528 Hz Solfeggio',
    },
    {
      title: `${mData.primaryChakra} Activation Protocol`,
      category: 'Chakra Activation',
      issueAddressed: `Strengthens ${mPlanet.planet} & ${bPlanet.planet} alignment for effortless client attraction and wealth retention.`,
      prescription: `Chant "${mPlanet.beejMantra}" 27 times at sunrise while holding ${mPlanet.gemstone} and playing ${mPlanet.soundFrequencyHz || '126.22 Hz & 639 Hz'} sound waves. Keep your spine erect and breathe into your ${mData.primaryChakra}.`,
      frequencyHz: mPlanet.soundFrequencyHz || '639 Hz & 852 Hz',
    },
    {
      title: 'Sacred Rudraksha & Crystal Fortune Shield',
      category: 'Rudraksha & Crystal',
      issueAddressed: 'Harmonizes name vibration (Namank) with birth destiny (Bhagyank) to stop last-minute deal cancellations.',
      prescription: `Wear a lab-certified ${
        mulank === 1 ? '1 or 12 Mukhi' : mulank === 2 ? '2 Mukhi' : mulank === 3 ? '5 Mukhi' : mulank === 4 ? '8 Mukhi' : mulank === 5 ? '4 Mukhi' : mulank === 6 ? '6 Mukhi' : mulank === 7 ? '9 Mukhi' : mulank === 8 ? '7 or 14 Mukhi' : '3 Mukhi'
      } Nepal Rudraksha along with a charged Pyrite + Citrine Wealth Bracelet energized with 432 Hz & 852 Hz Tibetan Singing Bowl acoustics.`,
      frequencyHz: '432 Hz & 852 Hz Crystal Resonance',
    },
    {
      title: 'Office & Desk Vastu Yantra Placement',
      category: 'Vastu & Yantra',
      issueAddressed: 'Accelerates cash recovery, high-ticket sales, and authoritative respect.',
      prescription: `Sit facing North or East while working. Place an energized copper Shree Yantra or ${mPlanet.planet} Yantra in the North-East corner of your work desk, sign key contracts using ${mPlanet.luckyColor.split(',')[0]} or gold-trimmed pen, and play 741 Hz & 963 Hz Space-Clearing chimes in your cabin.`,
      frequencyHz: '741 Hz & 963 Hz Vastu Space Resonance',
    },
    {
      title: 'Karmic Prarabdha Daan & Nada-Brahma Sound Remedy',
      category: 'Karmic Fortune Remedy',
      issueAddressed: 'Dissolves planetary enemy friction and ancestral blocks in career expansion.',
      prescription: `On ${mPlanet.luckyDays[0]}s, feed green fodder to cows or offer nourishment to the needy, and meditate for 11 minutes with ${bPlanet.soundFrequencyHz || '136.10 Hz Om & 639 Hz'} binaural resonance. Never accept free iron, black leather, or used oil on Saturdays.`,
      frequencyHz: bPlanet.soundFrequencyHz || '136.10 Hz Om & 639 Hz',
    },
  ];

  const goodBusinesses = [
    {
      field: 'Digital Commerce, Strategic Advisory & Professional Services',
      reason: `Strong secondary resonance with ${bPlanet.planet} (Bhagyank ${bhagyank}) and Namank ${namank} for scalable service revenue.`,
      successRate: 88,
      governingPlanet: `${bPlanet.planet} (${bhagyank})`,
    },
    {
      field: 'Real Estate Consulting, Architecture & Vastu/Interior Solutions',
      reason: 'Grounded earthly returns when structured with proper legal documentation and auspicious Muhurat timing.',
      successRate: 85,
      governingPlanet: 'Mercury & Venus',
    },
    {
      field: 'Export-Import, Wellness Products & Specialized Distribution',
      reason: `Harmonizes with ${mPlanet.planet}'s elemental flow for steady multi-city expansion.`,
      successRate: 84,
      governingPlanet: `${mPlanet.planet} (${mulank})`,
    },
    {
      field: 'Education, Training Academies & Financial Planning',
      reason: 'Sattvic knowledge-sharing multiplies long-term goodwill and client retention.',
      successRate: 82,
      governingPlanet: 'Jupiter (Guru)',
    },
  ];

  const secondaryChakra = bData.primaryChakra || 'Anahata (Heart) & Vishuddha (Throat)';
  const auraHealthSummary = `${name}'s bio-field radiates a ${mData.auraColor} governed by ${mPlanet.planet} (Mulank ${mulank}) and ${bPlanet.planet} (Bhagyank ${bhagyank}). Keeping the ${mData.primaryChakra} balanced prevents energy depletion and magnetizes high-value career breakthroughs.`;

  return {
    mulank,
    bhagyank,
    namank,
    dominantPlanet: `${mPlanet.planet} (${mPlanet.sanskritName})`,
    destinyPlanet: `${bPlanet.planet} (${bPlanet.sanskritName})`,
    perfectBusinesses,
    goodBusinesses,
    favorableProfessions,
    veryBadBusinesses,
    fortuneReadingRemedies,
    auraColor: mData.auraColor,
    primaryChakra: mData.primaryChakra,
    secondaryChakra,
    auraHealthSummary,
  };
}

/**
 * All-India Vedic Festivals Calendar & Personalized Client Puja / Muhurat Engine
 */
const RAW_INDIAN_FESTIVALS = [
  {
    id: 'makar-sankranti',
    name: 'Makar Sankranti / Pongal / Uttarayan',
    hindiName: 'मकर संक्रांति / उत्तरायण',
    date: '14 January 2026',
    vikramSamvatTithi: 'Pausha Krishna Ekadashi / सूर्य मकर प्रवेश',
    deity: 'Lord Surya Narayana (Sun God)',
    governingPlanet: 'Sun (Surya)',
    governingNumber: 1,
    significance: 'Marks the Sun’s transit into Capricorn (Uttarayana Punyakala), awakening radiant health, career promotion, and sovereign fame.',
    punyaKaalWindow: '09:03 AM – 05:46 PM IST',
    mahaPunyaKaal: '09:03 AM – 10:48 AM IST',
    rahuKaal: '12:30 PM – 01:50 PM IST',
    bhadraOrVishti: '03:15 PM – 04:40 PM IST',
  },
  {
    id: 'basant-panchami',
    name: 'Basant Panchami (Saraswati Puja)',
    hindiName: 'बसंत पंचमी / सरस्वती पूजा',
    date: '23 January 2026',
    vikramSamvatTithi: 'Magha Shukla Panchami',
    deity: 'Goddess Saraswati & Guru Brihaspati',
    governingPlanet: 'Jupiter (Guru)',
    governingNumber: 3,
    significance: 'Abhijit Abhuj Muhurat day for wisdom, starting new businesses, Vidyarambham, arts, and consulting mastery.',
    punyaKaalWindow: '07:13 AM – 12:33 PM IST',
    mahaPunyaKaal: '10:15 AM – 12:15 PM IST',
    rahuKaal: '11:10 AM – 12:30 PM IST',
    bhadraOrVishti: '04:20 PM – 05:50 PM IST',
  },
  {
    id: 'maha-shivratri',
    name: 'Maha Shivratri (Great Night of Shiva)',
    hindiName: 'महाशिवरात्रि',
    date: '15 February 2026',
    vikramSamvatTithi: 'Phalguna Krishna Chaturdashi',
    deity: 'Lord Sadashiva & Mata Parvati',
    governingPlanet: 'Saturn, Moon & Sun',
    governingNumber: 8,
    significance: 'Supreme night for Rudrabhishekam, dissolving Saturn/Rahu-Ketu karmic afflictions, Kaal Sarp & Vish Yoga neutralization, and spiritual awakening.',
    punyaKaalWindow: '06:11 PM – 12:59 AM IST (4 Prahar Puja)',
    mahaPunyaKaal: '12:09 AM – 01:00 AM IST (Nishita Kaal)',
    rahuKaal: '04:45 PM – 06:10 PM IST',
    bhadraOrVishti: '01:30 PM – 03:00 PM IST',
  },
  {
    id: 'holi-holika-dahan',
    name: 'Holika Dahan & Dhulandi (Holi)',
    hindiName: 'होलिका दहन एवं होली',
    date: '03 March 2026',
    vikramSamvatTithi: 'Phalguna Purnima',
    deity: 'Lord Narasimha, Prahlada & Radha-Krishna',
    governingPlanet: 'Moon & Mars',
    governingNumber: 9,
    significance: 'Burning of negativity, evil eye, and hidden enemies in the sacred fire of Holika during Pradosh Kaal (strictly after Bhadra).',
    punyaKaalWindow: '06:22 PM – 08:49 PM IST (Pradosh Holika Dahan)',
    mahaPunyaKaal: '06:35 PM – 07:55 PM IST',
    rahuKaal: '03:25 PM – 04:55 PM IST',
    bhadraOrVishti: '10:30 AM – 05:18 PM IST (Bhadra Punchha/Mukha - Avoid)',
  },
  {
    id: 'chaitra-navratri-gudi-padwa',
    name: 'Chaitra Navratri / Gudi Padwa / Ugadi (Hindu New Year)',
    hindiName: 'चैत्र नवरात्रि / गुड़ी पड़वा / नव संवत्सर',
    date: '19 March 2026',
    vikramSamvatTithi: 'Chaitra Shukla Pratipada (Vikram Samvat 2083)',
    deity: 'Goddess Adi Shakti Durga',
    governingPlanet: 'Venus & Mars',
    governingNumber: 6,
    significance: 'Sacred Kalash Sthapana (Ghatasthapana) to invoke the 9 forms of Goddess Durga for protection, health, and Shakti.',
    punyaKaalWindow: '06:26 AM – 10:24 AM IST (Ghatasthapana)',
    mahaPunyaKaal: '12:04 PM – 12:52 PM IST (Abhijit Muhurat)',
    rahuKaal: '01:55 PM – 03:25 PM IST',
    bhadraOrVishti: '04:30 PM – 06:00 PM IST',
  },
  {
    id: 'ram-navami',
    name: 'Shri Ram Navami',
    hindiName: 'श्री राम नवमी',
    date: '27 March 2026',
    vikramSamvatTithi: 'Chaitra Shukla Navami',
    deity: 'Lord Shri Ramachandra',
    governingPlanet: 'Sun (Surya)',
    governingNumber: 1,
    significance: 'Appearance day of Maryada Purushottam Shri Ram. Bestows dharmic victory, family unity, and royal prestige.',
    punyaKaalWindow: '11:13 AM – 01:41 PM IST (Madhyahna Kaal)',
    mahaPunyaKaal: '12:02 PM – 12:51 PM IST',
    rahuKaal: '10:50 AM – 12:20 PM IST',
    bhadraOrVishti: '03:30 PM – 05:00 PM IST',
  },
  {
    id: 'hanuman-jayanti',
    name: 'Hanuman Jayanti (Chaitra Purnima)',
    hindiName: 'श्री हनुमान जन्मोत्सव',
    date: '02 April 2026',
    vikramSamvatTithi: 'Chaitra Purnima',
    deity: 'Lord Sankat Mochan Hanuman',
    governingPlanet: 'Mars (Mangal) & Saturn (Shani)',
    governingNumber: 9,
    significance: 'Supreme festival for courage, victory over court cases, debt liberation (Rin Mochan), and Shani/Mangal Dosha protection.',
    punyaKaalWindow: '06:10 AM – 09:20 AM & 06:30 PM – 08:45 PM IST',
    mahaPunyaKaal: '11:59 AM – 12:49 PM IST (Abhijit Muhurat)',
    rahuKaal: '01:58 PM – 03:31 PM IST',
    bhadraOrVishti: '04:35 PM – 06:05 PM IST',
  },
  {
    id: 'akshaya-tritiya',
    name: 'Akshaya Tritiya (Unending Prosperity Day)',
    hindiName: 'अक्षय तृतीया (आखा तीज)',
    date: '19 April 2026',
    vikramSamvatTithi: 'Vaishakha Shukla Tritiya',
    deity: 'Lord Vishnu & Goddess Mahalakshmi',
    governingPlanet: 'Sun & Moon (Both Exalted)',
    governingNumber: 6,
    significance: 'Both Sun (in Aries) and Moon (in Taurus) are exalted. Any gold purchase, business launch, or charity done today multiplies infinitely (Akshaya).',
    punyaKaalWindow: '05:51 AM – 12:18 PM IST (Puja & Gold Purchase)',
    mahaPunyaKaal: '10:30 AM – 12:18 PM IST (Lakshmi-Kubera Yoga)',
    rahuKaal: '05:10 PM – 06:48 PM IST',
    bhadraOrVishti: '02:00 PM – 03:35 PM IST',
  },
  {
    id: 'guru-purnima',
    name: 'Guru Purnima (Vyasa Purnima)',
    hindiName: 'गुरु पूर्णिमा (व्यास पूर्णिमा)',
    date: '29 July 2026',
    vikramSamvatTithi: 'Ashadha Purnima',
    deity: 'Maharishi Ved Vyasa & Dakshinamurti Guru',
    governingPlanet: 'Jupiter (Guru)',
    governingNumber: 3,
    significance: 'Receiving Guru Diksha, strengthening Jupiter in the birth chart, and unlocking higher spiritual and financial wisdom.',
    punyaKaalWindow: '06:00 AM – 11:45 AM IST',
    mahaPunyaKaal: '07:30 AM – 09:15 AM IST (Amrit/Shubh Choghadiya)',
    rahuKaal: '12:27 PM – 02:09 PM IST',
    bhadraOrVishti: '03:50 PM – 05:30 PM IST',
  },
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan (Shravana Purnima)',
    hindiName: 'रक्षा बंधन (श्रावणी पूर्णिमा)',
    date: '28 August 2026',
    vikramSamvatTithi: 'Shravana Purnima',
    deity: 'Lord Indra, Vishnu & Lakshmi',
    governingPlanet: 'Moon & Mercury',
    governingNumber: 2,
    significance: 'Sacred thread of protection. Must strictly avoid Bhadra Kaal when tying the Raksha Sutra.',
    punyaKaalWindow: '01:32 PM – 09:08 PM IST (Post-Bhadra Aparahna & Pradosh)',
    mahaPunyaKaal: '01:45 PM – 04:20 PM IST (Aparahna Shubh Window)',
    rahuKaal: '10:46 AM – 12:22 PM IST',
    bhadraOrVishti: '05:55 AM – 01:30 PM IST (Bhadra Kaal - Strictly Avoid)',
  },
  {
    id: 'krishna-janmashtami',
    name: 'Shri Krishna Janmashtami',
    hindiName: 'श्री कृष्ण जन्माष्टमी',
    date: '04 September 2026',
    vikramSamvatTithi: 'Bhadrapada Krishna Ashtami (Rohini Nakshatra)',
    deity: 'Bhagwan Shri Krishna (Balgopal)',
    governingPlanet: 'Moon & Mercury',
    governingNumber: 5,
    significance: 'Midnight appearance of Lord Krishna. Bestows Santan Sukh (progeny bliss), magnetic charisma, and victory over diplomatic obstacles.',
    punyaKaalWindow: '11:57 PM – 12:43 AM IST (Nishita Midnight Puja)',
    mahaPunyaKaal: '12:05 AM – 12:35 AM IST (Rohini Abhishekam)',
    rahuKaal: '10:45 AM – 12:19 PM IST',
    bhadraOrVishti: '03:30 PM – 05:05 PM IST',
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Vinayaka Ganesh Chaturthi',
    hindiName: 'श्री गणेश चतुर्थी (सिद्धिविनायक स्थापना)',
    date: '14 September 2026',
    vikramSamvatTithi: 'Bhadrapada Shukla Chaturthi',
    deity: 'Lord Siddhivinayak Ganesha',
    governingPlanet: 'Ketu (7) & Mercury (5)',
    governingNumber: 7,
    significance: 'Vighnaharta Ganesha Sthapana removes all Ketu/Budha career obstacles. Note: Avoid looking at the Moon (Chandra Darshan) on Chaturthi night.',
    punyaKaalWindow: '11:03 AM – 01:32 PM IST (Madhyahna Ganesha Sthapana)',
    mahaPunyaKaal: '11:52 AM – 12:41 PM IST (Abhijit Muhurat)',
    rahuKaal: '07:38 AM – 09:11 AM IST',
    bhadraOrVishti: '09:15 PM – 11:59 PM IST (Avoid Moon Sighting - Mithya Kalank Dosha)',
  },
  {
    id: 'sharad-navratri',
    name: 'Sharad Navratri (Maha Navratri Ghatasthapana)',
    hindiName: 'शारदीय नवरात्रि (घटस्थापना)',
    date: '11 October 2026',
    vikramSamvatTithi: 'Ashwin Shukla Pratipada',
    deity: 'Nine Forms of Goddess Navadurga',
    governingPlanet: 'Venus, Moon & Rahu',
    governingNumber: 6,
    significance: 'Nine sacred nights of Shakti Sadhana, Chandi Path, Aura purification, and invoking invincible protection.',
    punyaKaalWindow: '06:19 AM – 10:12 AM IST (Kalash Sthapana)',
    mahaPunyaKaal: '11:44 AM – 12:30 PM IST (Abhijit Muhurat)',
    rahuKaal: '04:28 PM – 05:55 PM IST',
    bhadraOrVishti: '01:30 PM – 03:00 PM IST',
  },
  {
    id: 'dussehra-vijayadashami',
    name: 'Dussehra / Vijayadashami (Shastra & Vahan Puja)',
    hindiName: 'विजयादशमी / दशहरा',
    date: '20 October 2026',
    vikramSamvatTithi: 'Ashwin Shukla Dashami',
    deity: 'Lord Shri Ram & Goddess Aparajita Durga',
    governingPlanet: 'Sun & Mars',
    governingNumber: 9,
    significance: 'Sade-Teen Abhuj Muhurat for undisputed victory (Vijaya), purchasing vehicles/machinery, Ayudha Puja, and crossing borders (Seemollanghan).',
    punyaKaalWindow: '01:18 PM – 03:33 PM IST (Aparahna Puja)',
    mahaPunyaKaal: '02:03 PM – 02:49 PM IST (Vijaya Muhurat)',
    rahuKaal: '02:55 PM – 04:20 PM IST',
    bhadraOrVishti: '10:30 AM – 12:00 PM IST',
  },
  {
    id: 'karwa-chauth',
    name: 'Karwa Chauth (Sankashti Chaturthi)',
    hindiName: 'करवा चौथ व्रत',
    date: '29 October 2026',
    vikramSamvatTithi: 'Kartika Krishna Chaturthi',
    deity: 'Goddess Gauri, Lord Shiva, Kartikeya & Chandra Dev',
    governingPlanet: 'Moon & Venus',
    governingNumber: 2,
    significance: 'Sacred fast for marital longevity, Akhand Saubhagya, and strengthening Heart & Sacral Chakra bonds between spouses.',
    punyaKaalWindow: '05:38 PM – 06:54 PM IST (Sandhya Karwa Puja)',
    mahaPunyaKaal: '08:12 PM – 08:45 PM IST (Chandrodaya Moon Arghya)',
    rahuKaal: '01:28 PM – 02:51 PM IST',
    bhadraOrVishti: '09:00 AM – 10:30 AM IST',
  },
  {
    id: 'dhanteras',
    name: 'Dhanteras (Dhantrayodashi & Dhanvantari Jayanti)',
    hindiName: 'धनतेरस (धनत्रयोदशी)',
    date: '06 November 2026',
    vikramSamvatTithi: 'Kartika Krishna Trayodashi',
    deity: 'Lord Dhanvantari, Goddess Mahalakshmi & Kubera',
    governingPlanet: 'Venus, Jupiter & Mercury',
    governingNumber: 6,
    significance: 'Supreme day for purchasing Gold, Silver, Brass utensils, Account Books (Bahi-Khata), and lighting Yama Deepam for health and wealth.',
    punyaKaalWindow: '05:58 PM – 08:25 PM IST (Pradosh Kaal Vrishabha Lagna)',
    mahaPunyaKaal: '06:15 PM – 07:55 PM IST (Kubera-Lakshmi Puja)',
    rahuKaal: '10:42 AM – 12:04 PM IST',
    bhadraOrVishti: '03:10 PM – 04:35 PM IST',
  },
  {
    id: 'diwali-deepavali',
    name: 'Diwali / Deepavali (Mahalakshmi Pujan)',
    hindiName: 'दीपावली (महालक्ष्मी एवं कुबेर पूजन)',
    date: '08 November 2026',
    vikramSamvatTithi: 'Kartika Amavasya',
    deity: 'Goddess Mahalakshmi, Lord Ganesha & Maha Kali',
    governingPlanet: 'Venus (6) & Jupiter (3)',
    governingNumber: 6,
    significance: 'The grandest festival of wealth, light, and Siddhi. Performing Lakshmi-Ganesha Puja in Sthir Lagna (Vrishabha / Simha) anchors permanent prosperity in the home and office.',
    punyaKaalWindow: '05:32 PM – 08:08 PM IST (Pradosh Kaal)',
    mahaPunyaKaal: '05:54 PM – 07:50 PM IST (Sthir Vrishabha Lagna - Best for Household & Office)',
    rahuKaal: '04:09 PM – 05:31 PM IST (Strictly Avoid Starting Puja Here)',
    bhadraOrVishti: '01:25 PM – 02:50 PM IST',
  },
  {
    id: 'govardhan-puja-bhai-dooj',
    name: 'Govardhan Puja / Annakut & Bhai Dooj',
    hindiName: 'गोवर्धन पूजा एवं भाई दूज (यम द्वितीया)',
    date: '09 – 10 November 2026',
    vikramSamvatTithi: 'Kartika Shukla Pratipada & Dwitiya',
    deity: 'Lord Giriraj Krishna & Yamuna-Yama',
    governingPlanet: 'Moon & Mercury',
    governingNumber: 5,
    significance: 'Gratitude to nature, Gau-Seva, opening businesses post-Diwali, and sibling protection tilak.',
    punyaKaalWindow: '06:40 AM – 08:55 AM & 01:10 PM – 03:22 PM IST',
    mahaPunyaKaal: '01:15 PM – 03:15 PM IST (Aparahna Tilak & Puja)',
    rahuKaal: '07:58 AM – 09:20 AM IST',
    bhadraOrVishti: '11:45 AM – 01:00 PM IST',
  },
  {
    id: 'chhath-puja',
    name: 'Chhath Puja (Surya Shashthi Dala Chhath)',
    hindiName: 'छठ महापर्व (सूर्य षष्ठी अर्घ्य)',
    date: '15 November 2026',
    vikramSamvatTithi: 'Kartika Shukla Shashthi',
    deity: 'Lord Surya Dev & Chhathi Maiya',
    governingPlanet: 'Sun (Surya)',
    governingNumber: 1,
    significance: 'Direct solar prana absorption through Sandhya Arghya (setting sun) and Usha Arghya (rising sun) for invincible health, progeny protection, and high fame.',
    punyaKaalWindow: '05:27 PM (Sandhya Arghya) & 06:44 AM Next Day (Usha Arghya)',
    mahaPunyaKaal: '05:10 PM – 05:35 PM IST (Sunset River Arghya)',
    rahuKaal: '04:06 PM – 05:27 PM IST (Prepare offerings prior to 04:00 PM)',
    bhadraOrVishti: '12:15 PM – 01:40 PM IST',
  },
  {
    id: 'dev-deepawali',
    name: 'Dev Deepawali (Kartika Purnima)',
    hindiName: 'देव दीपावली (कार्तिक पूर्णिमा)',
    date: '24 November 2026',
    vikramSamvatTithi: 'Kartika Purnima',
    deity: 'Lord Shiva (Tripurari) & Lord Vishnu',
    governingPlanet: 'Jupiter, Moon & Sun',
    governingNumber: 3,
    significance: 'The Gods descend to bathe in the Ganga and celebrate Lord Shiva’s victory over Tripurasura. Deepdaan (lighting ghee lamps) removes 7 lifetimes of poverty.',
    punyaKaalWindow: '05:15 PM – 07:50 PM IST (Pradosh Deepdaan)',
    mahaPunyaKaal: '05:25 PM – 07:10 PM IST',
    rahuKaal: '02:45 PM – 04:05 PM IST',
    bhadraOrVishti: '10:30 AM – 12:00 PM IST',
  },
];

const FESTIVAL_DATES_BY_YEAR: Record<string, Record<number, string>> = {
  'makar-sankranti': {
    2026: '14 January 2026',
    2027: '14 January 2027',
    2028: '15 January 2028',
    2029: '14 January 2029',
    2030: '14 January 2030',
  },
  'basant-panchami': {
    2026: '23 January 2026',
    2027: '11 February 2027',
    2028: '31 January 2028',
    2029: '19 January 2029',
    2030: '07 February 2030',
  },
  'maha-shivratri': {
    2026: '15 February 2026',
    2027: '06 March 2027',
    2028: '23 February 2028',
    2029: '11 February 2029',
    2030: '02 March 2030',
  },
  'holi-holika-dahan': {
    2026: '03 March 2026',
    2027: '22 March 2027',
    2028: '11 March 2028',
    2029: '28 February 2029',
    2030: '19 March 2030',
  },
  'chaitra-navratri-gudi-padwa': {
    2026: '19 March 2026',
    2027: '07 April 2027',
    2028: '27 March 2028',
    2029: '16 March 2029',
    2030: '04 April 2030',
  },
  'ram-navami': {
    2026: '27 March 2026',
    2027: '15 April 2027',
    2028: '03 April 2028',
    2029: '23 March 2029',
    2030: '12 April 2030',
  },
  'hanuman-jayanti': {
    2026: '02 April 2026',
    2027: '20 April 2027',
    2028: '09 April 2028',
    2029: '29 March 2029',
    2030: '17 April 2030',
  },
  'akshaya-tritiya': {
    2026: '19 April 2026',
    2027: '08 May 2027',
    2028: '27 April 2028',
    2029: '16 April 2029',
    2030: '05 May 2030',
  },
  'guru-purnima': {
    2026: '29 July 2026',
    2027: '18 July 2027',
    2028: '06 July 2028',
    2029: '25 July 2029',
    2030: '15 July 2030',
  },
  'raksha-bandhan': {
    2026: '28 August 2026',
    2027: '17 August 2027',
    2028: '05 August 2028',
    2029: '23 August 2029',
    2030: '13 August 2030',
  },
  'krishna-janmashtami': {
    2026: '04 September 2026',
    2027: '25 August 2027',
    2028: '13 August 2028',
    2029: '01 September 2029',
    2030: '21 August 2030',
  },
  'ganesh-chaturthi': {
    2026: '14 September 2026',
    2027: '04 September 2027',
    2028: '23 August 2028',
    2029: '11 September 2029',
    2030: '01 September 2030',
  },
  'sharad-navratri': {
    2026: '11 October 2026',
    2027: '30 September 2027',
    2028: '19 September 2028',
    2029: '08 October 2029',
    2030: '28 September 2030',
  },
  'dussehra-vijayadashami': {
    2026: '20 October 2026',
    2027: '09 October 2027',
    2028: '28 September 2028',
    2029: '17 October 2029',
    2030: '06 October 2030',
  },
  'karwa-chauth': {
    2026: '29 October 2026',
    2027: '18 October 2027',
    2028: '07 October 2028',
    2029: '26 October 2029',
    2030: '15 October 2030',
  },
  dhanteras: {
    2026: '06 November 2026',
    2027: '27 October 2027',
    2028: '15 October 2028',
    2029: '03 November 2029',
    2030: '24 October 2030',
  },
  'diwali-deepavali': {
    2026: '08 November 2026',
    2027: '29 October 2027',
    2028: '17 October 2028',
    2029: '05 November 2029',
    2030: '26 October 2030',
  },
  'govardhan-puja-bhai-dooj': {
    2026: '09 – 10 November 2026',
    2027: '30 – 31 October 2027',
    2028: '18 – 19 October 2028',
    2029: '06 – 07 November 2029',
    2030: '27 – 28 October 2030',
  },
  'chhath-puja': {
    2026: '15 November 2026',
    2027: '04 November 2027',
    2028: '23 October 2028',
    2029: '11 November 2029',
    2030: '01 November 2030',
  },
  'dev-deepawali': {
    2026: '24 November 2026',
    2027: '14 November 2027',
    2028: '02 November 2028',
    2029: '21 November 2029',
    2030: '10 November 2030',
  },
};

const MONTH_MAP: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function parseFestivalDateString(dateStr: string): Date {
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10) || 1;
    const monthIdx = MONTH_MAP[parts[1].toLowerCase()] ?? 0;
    const year = parseInt(parts[2], 10) || 2026;
    return new Date(year, monthIdx, day, 12, 0, 0);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function getPersonalizedIndianFestivals(
  name: string,
  mulank: number,
  bhagyank: number,
  namank: number,
  rashi: string = 'Kanya (Virgo)',
  selectedYear: number = 2026,
  registrationDateIso?: string,
  strictCalendarYearOnly: boolean = false
): IndianFestivalPersonalized[] {
  const mPlanet = PLANETARY_PROFILES[mulank] || PLANETARY_PROFILES[1];
  const bPlanet = PLANETARY_PROFILES[bhagyank] || PLANETARY_PROFILES[1];

  const parsedReg =
    registrationDateIso && !isNaN(new Date(registrationDateIso).getTime())
      ? new Date(registrationDateIso)
      : new Date();
  const windowStart = new Date(
    parsedReg.getFullYear(),
    parsedReg.getMonth(),
    parsedReg.getDate(),
    0,
    0,
    0
  );

  const itemsWithSortTime = RAW_INDIAN_FESTIVALS.map((fest) => {
    // Determine effective year for this festival:
    // In rolling 12-month mode (default), any festival whose date in the registration year
    // has already elapsed before windowStart automatically advances to next year (year + 1)
    // so only the upcoming 12 months from the profile save date are shown!
    let effectiveYear = selectedYear;
    let yearDate =
      FESTIVAL_DATES_BY_YEAR[fest.id]?.[effectiveYear] ||
      fest.date.replace('2026', String(effectiveYear));

    if (!strictCalendarYearOnly) {
      const regYear = windowStart.getFullYear();
      const candidateYear = regYear >= 2026 && regYear <= 2030 ? regYear : 2026;
      const candidateStr =
        FESTIVAL_DATES_BY_YEAR[fest.id]?.[candidateYear] ||
        fest.date.replace('2026', String(candidateYear));
      const candidateDate = parseFestivalDateString(candidateStr);

      if (candidateDate.getTime() < windowStart.getTime()) {
        effectiveYear = candidateYear + 1;
        yearDate =
          FESTIVAL_DATES_BY_YEAR[fest.id]?.[effectiveYear] ||
          fest.date.replace('2026', String(effectiveYear));
      } else {
        effectiveYear = candidateYear;
        yearDate = candidateStr;
      }
    }

    const parsedFestDate = parseFestivalDateString(yearDate);
    const samvatYear = effectiveYear + 57;
    const personalYear = ((mulank + bhagyank + effectiveYear) % 9) || 9;

    const relMulank = getPlanetaryRelationship(mulank, fest.governingNumber);
    const relBhagyank = getPlanetaryRelationship(bhagyank, fest.governingNumber);
    const relNamank = getPlanetaryRelationship(namank, fest.governingNumber);
    const relPersonalYear = getPlanetaryRelationship(personalYear, fest.governingNumber);

    let score = 74;
    if (relMulank === 'friendly') score += 12;
    else if (relMulank === 'inimical') score -= 10;

    if (relBhagyank === 'friendly') score += 10;
    else if (relBhagyank === 'inimical') score -= 8;

    if (relNamank === 'friendly') score += 4;
    if (relPersonalYear === 'friendly') score += 3;
    if (mulank === fest.governingNumber || bhagyank === fest.governingNumber) score += 8;

    score = Math.min(99, Math.max(55, score));

    let verdictTag: IndianFestivalPersonalized['personalVerdictTag'] = 'Highly Favorable (Shubh)';
    if (score >= 90) verdictTag = 'Supremely Auspicious (Raj Yoga)';
    else if (score >= 78) verdictTag = 'Highly Favorable (Shubh)';
    else if (score >= 66) verdictTag = 'Balanced & Transformative';
    else verdictTag = 'Karmic Caution (Remedy Advised)';

    const tithiWithSamvat = fest.vikramSamvatTithi.includes('Vikram Samvat')
      ? `Chaitra Shukla Pratipada (Vikram Samvat ${samvatYear})`
      : `${fest.vikramSamvatTithi} (VS ${samvatYear})`;

    const howFestivalWillBeForClient =
      score >= 88
        ? `Supremely Fortunate for ${name} in ${effectiveYear} (Vikram Samvat ${samvatYear})! Because ${fest.name} is governed by Number ${fest.governingNumber} (${fest.governingPlanet}), which forms a direct Raj-Yoga friendship with your Mulank ${mulank} (${mPlanet.planet}), Bhagyank ${bhagyank} (${bPlanet.planet}), and ${effectiveYear} Personal Year ${personalYear}, this festival opens major doors for wealth accumulation, business breakthroughs, and divine protection for your ${rashi} Moon sign.`
        : score >= 75
        ? `Auspicious & Uplifting for ${name} in ${effectiveYear}. The cosmic energy of ${fest.deity} harmonizes smoothly with your birth chart (${rashi}), bringing domestic joy, emotional clarity, and steady financial gains when rituals are performed in your personalized Hora.`
        : `Karmically Transformative for ${name} in ${effectiveYear}. Since ${fest.governingPlanet} (${fest.governingNumber}) has subtle planetary tension with your birth ruler ${mPlanet.planet} (${mulank}), avoid impulsive arguments or risky financial commitments on this day. Performing the prescribed Puja during the Best Muhurat below converts obstacles into spiritual protection.`;

    // Personalized Best Hora adjustment inside Maha Punya Kaal
    const auspiciousBestPoojaTime = {
      window: fest.mahaPunyaKaal,
      muhuratName: `Siddha ${mPlanet.planet}-${fest.governingPlanet} Amrit Muhurat (${effectiveYear})`,
      whyBestForClient: `Specifically calibrated for Mulank ${mulank} & Bhagyank ${bhagyank} (${rashi}). Performing your Sankalpa and main Arghya/Aarti in this exact window multiplies your Aura frequency and locks in ${fest.deity}'s grace.`,
    };

    const sahiPoojaTime = {
      window: fest.punyaKaalWindow,
      description: `Classical Shastra-approved Punya Kaal / Pradosh window suitable for general family worship, mantra japa, and prasad distribution.`,
    };

    const badPoojaTime = {
      window: fest.bhadraOrVishti,
      reason: `Conflicts with Vishti Karan / Bhadra shadow or discordant planetary sub-period for ${mPlanet.planet}. Rituals started here face mental distraction or incomplete fruits.`,
    };

    const worstPoojaTime = {
      window: fest.rahuKaal,
      reason: `STRICTLY AVOID: Overlaps with Rahu Kaal & inimical Hora for your Mulank ${mulank} (Enemy numbers: ${mPlanet.enemyNumbers.join(', ') || '4, 8'}). Never light the primary Sankalpa Diya or sign financial ledgers during this slot.`,
    };

    // Personalized Offerings & Aura Scan Remedy
    const diyaType =
      [1, 3, 9].includes(mulank)
        ? 'Pure Cow Ghee Diya with a pinch of Saffron (Kesar) & Red Cotton Wick'
        : [2, 6].includes(mulank)
        ? 'Pure Cow Ghee Diya with Camphor (Kapoor) & White/Rose Wick in a Silver/Brass lamp'
        : 'Sesame (Til) or Mustard Oil Diya with 2 Cloves (Laung) & Black Sesame seeds';

    const direction = [1, 3, 9].includes(mulank)
      ? 'Face East or North-East (Ishaan Kon)'
      : [5, 6, 2].includes(mulank)
      ? 'Face North (Kubera Disha)'
      : 'Face East while seated on a wool/kusha asana';

    const offerings =
      fest.governingNumber === 1 || fest.governingNumber === 9
        ? 'Red Hibiscus / Marigold flowers, Jaggery (Gud), Pomegranate, and Wheat/Copper dakshina'
        : fest.governingNumber === 3 || fest.governingNumber === 6
        ? 'Yellow Lotus / Rose flowers, Kesar Pedha / Kheer, Turmeric, and Silver/Gold coin worship'
        : 'Belpatra, White flowers, Panchamrit, Coconut, and Blue/White sesame sweets';

    const weekdayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = weekdayList[parsedFestDate.getDay()] || 'Thursday';

    const item: IndianFestivalPersonalized = {
      id: fest.id,
      name: fest.name,
      hindiName: fest.hindiName,
      date: yearDate,
      dayOfWeek,
      vikramSamvatTithi: tithiWithSamvat,
      deity: fest.deity,
      governingPlanet: fest.governingPlanet,
      governingNumber: fest.governingNumber,
      significance: fest.significance,
      personalImpactScore: score,
      personalVerdictTag: verdictTag,
      howFestivalWillBeForClient,
      auspiciousBestPoojaTime,
      sahiPoojaTime,
      normalGoodPoojaTime: sahiPoojaTime,
      badPoojaTime,
      avoidBhadraPoojaTime: badPoojaTime,
      worstPoojaTime,
      personalizedRitualAndAuraRemedy: {
        offerings,
        diyaAndDirection: `${diyaType} • ${direction}`,
        mantraForClient: `${mPlanet.beejMantra} (11x) + Om ${fest.deity.replace('Lord ', '').replace('Goddess ', '')} Namah (27x)`,
        auraCleansingTip: `Before entering the Puja altar, sprinkle Ganga Jal + Rose water over your Crown Chakra, wear ${mPlanet.luckyColor.split(',')[0]} attire, and play ${PLANETARY_PROFILES[fest.governingNumber]?.soundFrequencyHz || '432 Hz & 528 Hz'} sacred bell/shankha sound frequencies to synchronize your aura.`,
        soundFrequencyHz: PLANETARY_PROFILES[fest.governingNumber]?.soundFrequencyHz || '432 Hz & 528 Hz Sacred Resonance',
      },
    };

    return {
      item,
      sortTime: parsedFestDate.getTime(),
    };
  });

  if (!strictCalendarYearOnly) {
    itemsWithSortTime.sort((a, b) => a.sortTime - b.sortTime);
  }

  return itemsWithSortTime.map((entry) => entry.item);
}
