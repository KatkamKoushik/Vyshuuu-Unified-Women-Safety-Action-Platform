import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSecuritySetting, setSecuritySetting } from '../services/storageService';

export type LanguageCode = 'en' | 'te' | 'hi';

export interface Translations {
  appName: string;
  verifiedBadge: string;
  quickDisguise: string;
  sosButton: string;
  askAssistant: string;
  moveTab: string;
  protectTab: string;
  actTab: string;
  vaultTab: string;
  currentLocation: string;
  destination: string;
  startWalk: string;
  saveRoute: string;
  photos: string;
  privacy: string;
  searchTitle: string;
  done: string;
  clear: string;
  cancel: string;
  useCurrentGps: string;
  nearbyPark: string;
  nearbyPharmacy: string;
  nearbyPolice: string;
  nearbyTransit: string;
  pedestrianNotice: string;
  tooFarWarning: string;
  vaultLocked: string;
  unlockVault: string;
  enrollPin: string;
  confirmPin: string;
  pinMismatch: string;
  incorrectPin: string;
  lockoutActive: string;
  settings: string;
  theme: string;
  language: string;
  faq: string;
  support: string;
  emergencyTitle: string;
  dial112: string;
  womenHelpline: string;
  cybercrimeHelpline: string;
  draftPetition: string;
  incidentLogs: string;
  statutoryDirectory: string;
}

export const DICTIONARY: Record<LanguageCode, Translations> = {
  en: {
    appName: 'ResQ',
    verifiedBadge: '[VERIFIED]',
    quickDisguise: 'Quick Disguise',
    sosButton: '112 SOS',
    askAssistant: 'AI Safety Assistant',
    moveTab: 'Move',
    protectTab: 'Protect',
    actTab: 'Act',
    vaultTab: 'Vault',
    currentLocation: 'Current Location',
    destination: 'Destination',
    startWalk: 'Start Walk',
    saveRoute: 'Save',
    photos: 'Photos',
    privacy: 'Privacy',
    searchTitle: 'Choose Route Points',
    done: 'Done',
    clear: 'Clear',
    cancel: 'Cancel',
    useCurrentGps: 'Use Current Location (GPS)',
    nearbyPark: 'Near Park',
    nearbyPharmacy: 'Near Pharmacy',
    nearbyPolice: 'Near Police',
    nearbyTransit: 'Near Metro / Bus',
    pedestrianNotice: 'Notice: Route is long for walking. Consider transit for trips over 5 km.',
    tooFarWarning: 'Distance exceeds realistic walking distance. Please choose a nearby destination under 5 km.',
    vaultLocked: 'Vault Authentication Required',
    unlockVault: 'Unlock Protected Vault',
    enrollPin: 'Enroll 4-Digit Vault PIN',
    confirmPin: 'Confirm Vault PIN',
    pinMismatch: 'PINs do not match. Please re-enter.',
    incorrectPin: 'Incorrect PIN. Please try again.',
    lockoutActive: 'Keypad locked due to multiple failed attempts. Please wait.',
    settings: 'Settings',
    theme: 'Color Theme',
    language: 'Language',
    faq: 'Frequently Asked Questions',
    support: 'Support & Helplines',
    emergencyTitle: 'Emergency Response Hub',
    dial112: 'Call 112 Helpline',
    womenHelpline: 'Women Helpline (1091)',
    cybercrimeHelpline: 'National Cybercrime (1930)',
    draftPetition: 'Draft Petition',
    incidentLogs: 'Recorded Incidents',
    statutoryDirectory: 'Statutory Directory',
  },
  te: {
    appName: 'రెస్క్యూ (ResQ)',
    verifiedBadge: '[ధృవీకరించబడింది]',
    quickDisguise: 'త్వరిత కాలిక్యులేటర్',
    sosButton: '112 అత్యవసరం',
    askAssistant: 'ఏఐ భద్రతా సహాయకుడు',
    moveTab: 'నడక మార్గం',
    protectTab: 'సాక్ష్యాల నమోదు',
    actTab: 'చట్టపరమైన ఫిర్యాదు',
    vaultTab: 'రక్షిత లాకర్',
    currentLocation: 'ప్రస్తుత స్థానం',
    destination: 'గమ్యస్థానం',
    startWalk: 'నడక ప్రారంభించు',
    saveRoute: 'భద్రపరచు',
    photos: 'ఫోటోలు',
    privacy: 'గోప్యత',
    searchTitle: 'మార్గాన్ని ఎంచుకోండి',
    done: 'పూర్తయింది',
    clear: 'తుడిచివేయి',
    cancel: 'రద్దు చేయి',
    useCurrentGps: 'ప్రస్తుత జీపీఎస్ స్థానాన్ని వాడండి',
    nearbyPark: 'సమీప పార్క్',
    nearbyPharmacy: 'సమీప మందుల దుకాణం',
    nearbyPolice: 'సమీప పోలీస్ స్టేషన్',
    nearbyTransit: 'సమీప బస్సు / మెట్రో',
    pedestrianNotice: 'గమనిక: ఈ మార్గం నడకకు చాలా దూరం. 5 కి.మీ దాటితే వాహనాన్ని వాడండి.',
    tooFarWarning: 'నడవడానికి చాలా ఎక్కువ దూరం. దయచేసి 5 కి.మీ లోపు స్థలాన్ని ఎంచుకోండి.',
    vaultLocked: 'రక్షిత లాకర్ లాక్ చేయబడింది',
    unlockVault: 'లాకర్ అన్‌లాక్ చేయండి',
    enrollPin: '4 అంకెల పిన్ నమోదు చేయండి',
    confirmPin: 'పిన్ నిర్ధారించండి',
    pinMismatch: 'పిన్లు సరిపోలలేదు. మళ్లీ ప్రయత్నించండి.',
    incorrectPin: 'తప్పు పిన్. మళ్లీ ప్రయత్నించండి.',
    lockoutActive: 'కీప్యాడ్ తాత్కాలికంగా లాక్ చేయబడింది. వేచి ఉండండి.',
    settings: 'సెట్టింగ్స్',
    theme: 'రంగు థీమ్',
    language: 'భాష',
    faq: 'తరచుగా అడిగే ప్రశ్నలు',
    support: 'సహాయ కేంద్రాలు & హెల్ప్‌లైన్లు',
    emergencyTitle: 'అత్యవసర రక్షణ కేంద్రం',
    dial112: '112 కు కాల్ చేయండి',
    womenHelpline: 'మహిళా హెల్ప్‌లైన్ (1091)',
    cybercrimeHelpline: 'సైబర్‌క్రైమ్ హెల్ప్‌లైన్ (1930)',
    draftPetition: 'ఫిర్యాదు ముసాయిదా',
    incidentLogs: 'నమోదైన సంఘటనలు',
    statutoryDirectory: 'అధికార కేంద్రాల జాబితా',
  },
  hi: {
    appName: 'रेस्क्यू (ResQ)',
    verifiedBadge: '[सत्यापित]',
    quickDisguise: 'त्वरित कैलकुलेटर',
    sosButton: '112 आपातकालीन',
    askAssistant: 'एआई सुरक्षा सहायक',
    moveTab: 'मार्ग (Move)',
    protectTab: 'सुरक्षा (Protect)',
    actTab: 'कार्रवाई (Act)',
    vaultTab: 'वॉल्ट (Vault)',
    currentLocation: 'वर्तमान स्थान',
    destination: 'गंतव्य',
    startWalk: 'पैदल यात्रा शुरू करें',
    saveRoute: 'सुरक्षित करें',
    photos: 'तस्वीरें',
    privacy: 'गोपनीयता',
    searchTitle: 'मार्ग बिंदु चुनें',
    done: 'संपन्न',
    clear: 'साफ़ करें',
    cancel: 'रद्द करें',
    useCurrentGps: 'वर्तमान जीपीएस स्थान का उपयोग करें',
    nearbyPark: 'निकटतम पार्क',
    nearbyPharmacy: 'निकटतम दवा दुकान',
    nearbyPolice: 'निकटतम पुलिस स्टेशन',
    nearbyTransit: 'निकटतम बस / मेट्रो',
    pedestrianNotice: 'सूचना: यह पैदल मार्ग बहुत लंबा है। 5 किमी से अधिक के लिए वाहन का उपयोग करें।',
    tooFarWarning: 'दूरी पैदल चलने के लिए बहुत अधिक है। कृपया 5 किमी के भीतर गंतव्य चुनें।',
    vaultLocked: 'वॉल्ट प्रमाणीकरण आवश्यक',
    unlockVault: 'सुरक्षित वॉल्ट अनलॉक करें',
    enrollPin: '4 अंकों का पिन दर्ज करें',
    confirmPin: 'पिन की पुष्टि करें',
    pinMismatch: 'पिन मेल नहीं खाते। पुनः प्रयास करें।',
    incorrectPin: 'गलत पिन। पुनः प्रयास करें।',
    lockoutActive: 'कीपैड अस्थायी रूप से लॉक है। कृपया प्रतीक्षा करें।',
    settings: 'सेटिंग्स',
    theme: 'रंग थीम',
    language: 'भाषा',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    support: 'सहायता एवं हेल्पलाइन',
    emergencyTitle: 'आपातकालीन सहायता केंद्र',
    dial112: '112 पर कॉल करें',
    womenHelpline: 'महिला हेल्पलाइन (1091)',
    cybercrimeHelpline: 'साइबर अपराध हेल्पलाइन (1930)',
    draftPetition: 'शिकायत ड्राफ्ट करें',
    incidentLogs: 'दर्ज घटनाएं',
    statutoryDirectory: 'वैधानिक निर्देशिका',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: DICTIONARY.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    getSecuritySetting('app_language', 'en').then((saved) => {
      if (saved === 'en' || saved === 'te' || saved === 'hi') {
        setLanguageState(saved);
      }
    });
  }, []);

  const handleSetLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setSecuritySetting('app_language', lang).catch(() => {});
  };

  const currentTranslations = DICTIONARY[language] || DICTIONARY.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

