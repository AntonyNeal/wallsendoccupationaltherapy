import React from 'react';
import styled from 'styled-components';
import { TenantConfig } from '../types';

interface ContactPageProps {
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  h2 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1.5rem;
  }
  
  .info-item {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    align-items: start;
    
    .icon {
      font-size: 1.5rem;
    }
    
    .content {
      flex: 1;
      
      strong {
        display: block;
        margin-bottom: 0.3rem;
        color: #333;
      }
      
      a {
        color: ${props => props.theme.colors.secondary};
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
`;

const MapPlaceholder = styled.div`
  background: #e9ecef;
  height: 300px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

const ContactPage: React.FC<ContactPageProps> = ({ config }) => {
  return (
    <Container>
      <Title>Contact Us</Title>
      
      <Grid>
        <InfoCard>
          <h2>Get in Touch</h2>
          
          <div className="info-item">
            <span className="icon">📞</span>
            <div className="content">
              <strong>Phone</strong>
              <a href={`tel:${config.businessInfo.phone}`}>{config.businessInfo.phone}</a>
            </div>
          </div>
          
          <div className="info-item">
            <span className="icon">✉️</span>
            <div className="content">
              <strong>Email</strong>
              <a href={`mailto:${config.businessInfo.email}`}>{config.businessInfo.email}</a>
            </div>
          </div>
          
          <div className="info-item">
            <span className="icon">📍</span>
            <div className="content">
              <strong>Location</strong>
              <p>
                {config.businessInfo.address.street && `${config.businessInfo.address.street}, `}
                {config.businessInfo.address.suburb}, {config.businessInfo.address.state}{' '}
                {config.businessInfo.address.postcode}
                <br />
                {config.businessInfo.address.country}
              </p>
            </div>
          </div>
          
          <div className="info-item">
            <span className="icon">🌐</span>
            <div className="content">
              <strong>Website</strong>
              <a href={config.businessInfo.website} target="_blank" rel="noopener noreferrer">
                {config.businessInfo.website}
              </a>
            </div>
          </div>
          
          <div className="info-item">
            <span className="icon">🏢</span>
            <div className="content">
              <strong>ABN</strong>
              <p>{config.businessInfo.abn}</p>
            </div>
          </div>
        </InfoCard>
        
        <InfoCard>
          <h2>Business Hours</h2>
          
          <div style={{ lineHeight: '1.8' }}>
            <p><strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM</p>
            <p><strong>Saturday:</strong> By Appointment</p>
            <p><strong>Sunday:</strong> Closed</p>
          </div>
          
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: '#e7f3ff', 
            borderRadius: '4px',
            borderLeft: `4px solid ${config.branding.primaryColor}`
          }}>
            <strong>NDIS Services</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              We provide services during business hours and can arrange 
              appointments to suit your needs. Home visits available for 
              home modification assessments.
            </p>
          </div>
        </InfoCard>
      </Grid>
      
      <div style={{ marginTop: '2rem' }}>
        <InfoCard>
          <h2>Location Map</h2>
          <MapPlaceholder>
            Map placeholder - Wallsend, NSW 2287, Australia
            <br />
            <small>(Integrate Google Maps or similar service)</small>
          </MapPlaceholder>
          <p style={{ marginTop: '1rem', textAlign: 'center', color: '#666' }}>
            Serving Wallsend and surrounding areas in Newcastle, NSW
          </p>
        </InfoCard>
      </div>
    </Container>
  );
};

export default ContactPage;
