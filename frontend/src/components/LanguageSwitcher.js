import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      className="language-switcher"
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="pt-BR">PT</option>
      <option value="en">EN</option>
    </select>
  );
};

export default LanguageSwitcher;