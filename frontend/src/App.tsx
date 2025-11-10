import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import { tenantService } from './services/tenant.service';
import { TenantConfig } from './types';
import { GlobalStyle } from './styles/GlobalStyle';

function App() {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const tenantConfig = await tenantService.getConfig();
        setConfig(tenantConfig);
        
        // Update page title and favicon
        document.title = tenantConfig.name;
        const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (favicon && tenantConfig.branding.favicon) {
          favicon.href = tenantConfig.branding.favicon;
        }
      } catch (error) {
        console.error('Error loading tenant configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!config) {
    return <div>Error loading configuration</div>;
  }

  const theme = {
    colors: {
      primary: config.branding.primaryColor,
      secondary: config.branding.secondaryColor,
      accent: config.branding.accentColor,
    },
    businessInfo: config.businessInfo,
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <div className="App">
          <Header config={config} />
          <main>
            <Routes>
              <Route path="/" element={<HomePage config={config} />} />
              <Route path="/services" element={<ServicesPage config={config} />} />
              <Route path="/booking" element={<BookingPage config={config} />} />
              <Route path="/contact" element={<ContactPage config={config} />} />
            </Routes>
          </main>
          <Footer config={config} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
