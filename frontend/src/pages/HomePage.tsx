import React from 'react';
import styled from 'styled-components';
import { TenantConfig } from '../types';

interface HomePageProps {
  config: TenantConfig;
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled.section`
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 2rem;
`;

const CTAButton = styled.a`
  display: inline-block;
  background-color: white;
  color: ${props => props.theme.colors.primary};
  padding: 1rem 2rem;
  border-radius: 4px;
  font-weight: bold;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const Features = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1rem;
  }
`;

const ServicesSection = styled.section`
  margin: 3rem 0;
  
  h2 {
    text-align: center;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 2rem;
    font-size: 2rem;
  }
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ServiceCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid ${props => props.theme.colors.secondary};
  
  h4 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 0.5rem;
  }
  
  .price {
    color: ${props => props.theme.colors.secondary};
    font-weight: bold;
    margin-top: 0.5rem;
  }
  
  .ndis-badge {
    display: inline-block;
    background: ${props => props.theme.colors.accent};
    color: ${props => props.theme.colors.primary};
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
`;

const HomePage: React.FC<HomePageProps> = ({ config }) => {
  return (
    <Container>
      <Hero>
        <Title>Welcome to {config.name}</Title>
        <Subtitle>{config.branding.tagline}</Subtitle>
        <CTAButton href="/booking">Book an Appointment</CTAButton>
      </Hero>

      <Features>
        <FeatureCard>
          <h3>🏥 Expert Care</h3>
          <p>Experienced occupational therapists providing personalized care for your needs.</p>
        </FeatureCard>
        <FeatureCard>
          <h3>♿ NDIS Registered</h3>
          <p>Fully registered NDIS provider offering comprehensive services for participants.</p>
        </FeatureCard>
        <FeatureCard>
          <h3>🏠 Home Modifications</h3>
          <p>Professional assessments and recommendations for home accessibility improvements.</p>
        </FeatureCard>
      </Features>

      <ServicesSection>
        <h2>Our Services</h2>
        <ServiceGrid>
          {config.services.map((service) => (
            <ServiceCard key={service.id}>
              <h4>{service.name}</h4>
              <p>{service.description}</p>
              <p className="price">
                ${(service.price / 100).toFixed(2)} ({service.duration} min)
              </p>
              {service.ndisEnabled && (
                <span className="ndis-badge">NDIS Available</span>
              )}
            </ServiceCard>
          ))}
        </ServiceGrid>
      </ServicesSection>
    </Container>
  );
};

export default HomePage;
