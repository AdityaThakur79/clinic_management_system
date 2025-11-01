export const CONTACT_PHONE_RAW = "7977483031";
export const CONTACT_COUNTRY_CODE = "+91";
export const CONTACT_PHONE_E164 = `${CONTACT_COUNTRY_CODE}${CONTACT_PHONE_RAW}`; // +919867794003
export const CONTACT_WA_NUMBER = CONTACT_PHONE_E164.replace("+", ""); // 919867794003

export const getWhatsAppLink = (presetMessage = "Hi Aartiket Speech & Hearing Care!") => {
  const message = encodeURIComponent(presetMessage);
  const isMobile = /iPhone|Android|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  return isMobile
    ? `https://wa.me/${CONTACT_WA_NUMBER}?text=${message}`
    : `https://web.whatsapp.com/send?phone=${CONTACT_WA_NUMBER}&text=${message}`;
};

export default {
  CONTACT_PHONE_RAW,
  CONTACT_COUNTRY_CODE,
  CONTACT_PHONE_E164,
  CONTACT_WA_NUMBER,
  getWhatsAppLink,
};


