import React from 'react';
import styled from 'styled-components';
import { TenantConfig } from '../types';

interface ServicesPageProps {
  config: TenantConfig;
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 2rem;
`;

const ServicesGrid = styled.div`
  display: grid;
  gap: 2rem;
`;

const ServiceCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid ${props => props.theme.colors.primary};
  
  h2 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1rem;
  }
  
  .meta {
    display: flex;
    gap: 2rem;
    margin: 1rem 0;
    color: #666;
  }
  
  .price {
    font-size: 1.5rem;
    color: ${props => props.theme.colors.secondary};
    font-weight: bold;
  }
  
  .ndis-info {
    background: ${props => props.theme.colors.accent};
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    
    h4 {
      color: ${props => props.theme.colors.primary};
      margin-bottom: 0.5rem;
    }
    
    .support-items {
      font-size: 0.9rem;
      color: #555;
    }
  }
`;

const BookButton = styled.a`
  display: inline-block;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  margin-top: 1rem;
  transition: background 0.3s;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
  }
`;

const ServicesPage: React.FC<ServicesPageProps> = ({ config }) => {
  return (
    <Container>
      <Title>Our Services</Title>
      
      <ServicesGrid>
        {config.services.map((service) => (
          <ServiceCard key={service.id}>
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            
            <div className="meta">
              <span>⏱️ {service.duration} minutes</span>
              <span className="price">${(service.price / 100).toFixed(2)}</span>
            </div>
            
            {service.ndisEnabled && service.ndisSupportItems && (
              <div className="ndis-info">
                <h4>✓ NDIS Registered Service</h4>
                <p className="support-items">
                  Support Items: {service.ndisSupportItems.join(', ')}
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  This service can be claimed under your NDIS plan.
                </p>
              </div>
            )}
            
            <BookButton href="/booking">Book This Service</BookButton>
          </ServiceCard>
        ))}
      </ServicesGrid>
      
      <div style={{ marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '8px' }}>
        <h2 style={{ color: config.branding.primaryColor }}>About Our NDIS Services</h2>
        <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
          We are a registered NDIS provider committed to supporting participants in achieving their goals 
          and improving their quality of life. Our occupational therapy services are designed to help 
          you develop skills for daily living, improve your independence, and participate more fully in 
          your community.
        </p>
        <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
          All our services can be invoiced directly to the NDIA if you are plan-managed or self-managed. 
          We work closely with support coordinators and plan managers to ensure seamless service delivery.
        </p>
      </div>
    </Container>
  );
};

export default ServicesPage;
