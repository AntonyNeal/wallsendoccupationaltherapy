import React from 'react';
import styled from 'styled-components';
import { TenantConfig } from '../types';

interface FooterProps {
  config: TenantConfig;
}

const FooterContainer = styled.footer`
  background-color: #2c3e50;
  color: white;
  padding: 2rem;
  margin-top: 4rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const Section = styled.div`
  h3 {
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.accent};
  }
  
  p, a {
    margin: 0.5rem 0;
    display: block;
    color: white;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  opacity: 0.7;
`;

const Footer: React.FC<FooterProps> = ({ config }) => {
  return (
    <FooterContainer>
      <FooterContent>
        <Section>
          <h3>Contact Us</h3>
          <p>{config.businessInfo.phone}</p>
          <p>{config.businessInfo.email}</p>
          <p>
            {config.businessInfo.address.suburb}, {config.businessInfo.address.state}{' '}
            {config.businessInfo.address.postcode}
          </p>
        </Section>
        
        <Section>
          <h3>Services</h3>
          <a href="/services">NDIS Services</a>
          <a href="/services">Home Modifications</a>
          <a href="/services">Occupational Therapy</a>
        </Section>
        
        <Section>
          <h3>Quick Links</h3>
          <a href="/booking">Book Appointment</a>
          <a href="/contact">Contact Us</a>
          <a href="/about">About Us</a>
        </Section>
      </FooterContent>
      
      <Copyright>
        <p>© {new Date().getFullYear()} {config.businessInfo.legalName}. All rights reserved.</p>
        <p>ABN: {config.businessInfo.abn}</p>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
