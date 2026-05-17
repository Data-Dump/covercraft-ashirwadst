const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./src/data/schools.json', 'utf8'));

const translations = {
  "St. Thomas Senior Secondary School": "सेंट थॉमस सीनियर सेकेंडरी स्कूल",
  "Dashpur Vidya Mandir": "दशपुर विद्या मंदिर",
  "Lotus Valley School": "लोटस वैली स्कूल",
  "Vatsalya Public School": "वात्सल्य पब्लिक स्कूल",
  "Saraswati Vidhya Mandir Higher Secondary School": "सरस्वती विद्या मंदिर उच्चतर माध्यमिक विद्यालय",
  "Delhi Public School Mandsaur": "दिल्ली पब्लिक स्कूल मंदसौर",
  "Jain Public School": "जैन पब्लिक स्कूल",
  "Mandsaur International School": "मंदसौर इंटरनेशनल स्कूल",
  "Edify School Mandsaur": "एडीफाई स्कूल मंदसौर",
  "Karni International School": "करणी इंटरनेशनल स्कूल",
  "Guru Pratap School": "गुरु प्रताप स्कूल",
  "Sunrise Universal School": "सनराइज यूनिवर्सल स्कूल",
  "Subhash English Higher Secondary School": "सुभाष इंग्लिश हायर सेकेंडरी स्कूल",
  "N.S. Singhvi Higher Secondary School": "एन.एस. सिंघवी हायर सेकेंडरी स्कूल",
  "Ebenezer English Higher Secondary School": "एबेनेज़र इंग्लिश हायर सेकेंडरी स्कूल",
  "St. Kabir Public School": "सेंट कबीर पब्लिक स्कूल",
  "Government Nutan Higher Secondary School": "शासकीय नूतन उच्चतर माध्यमिक विद्यालय",
  "Nalanda Academy": "नालंदा अकादमी",
  "Shree J K Public School": "श्री जे के पब्लिक स्कूल",
  "Panchsheel Academy": "पंचशील अकादमी",
  "Alpha International School": "अल्फा इंटरनेशनल स्कूल",
  "Shri Sai Public School": "श्री साई पब्लिक स्कूल"
};

const cityHi = "मंदसौर";
const stateHi = "मध्य प्रदेश";

data.forEach(s => {
  s.nameHi = translations[s.name] || s.name;
  if (s.city) s.cityHi = cityHi;
  if (s.state) s.stateHi = stateHi;
});

fs.writeFileSync('./src/data/schools.json', JSON.stringify(data, null, 2));
console.log('Translated schools.json');
