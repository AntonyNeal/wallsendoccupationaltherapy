import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TenantConfig, Service } from '../types';
import { bookingService } from '../services/booking.service';

interface BookingPageProps {
  config: TenantConfig;
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 2rem;
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input[type="checkbox"] {
    width: auto;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 1rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`;

const InfoBox = styled.div`
  background: #e7f3ff;
  border-left: 4px solid ${props => props.theme.colors.primary};
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 4px;
`;

const BookingPage: React.FC<BookingPageProps> = ({ config }) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    ndis: false,
    ndisNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const selectedServiceData = config.services.find(s => s.id === selectedService);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // In a real implementation, this would create the booking
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setMessage({ 
        type: 'success', 
        text: 'Booking request submitted successfully! We will contact you to confirm your appointment.' 
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        ndis: false,
        ndisNumber: '',
        notes: '',
      });
      setSelectedService('');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to submit booking. Please try again or contact us directly.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Container>
      <Title>Book an Appointment</Title>
      
      <InfoBox>
        <strong>📅 Booking Information</strong>
        <p style={{ marginTop: '0.5rem' }}>
          Select your preferred service and provide your details. We'll contact you to confirm 
          your appointment time. For NDIS participants, please have your NDIS number ready.
        </p>
      </InfoBox>

      {message && <Message type={message.type}>{message.text}</Message>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="service">Service *</label>
          <select 
            id="service" 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
            <option value="">Select a service</option>
            {config.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${(service.price / 100).toFixed(2)} ({service.duration} min)
              </option>
            ))}
          </select>
        </FormGroup>

        {selectedServiceData && (
          <InfoBox>
            <strong>{selectedServiceData.name}</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              {selectedServiceData.description}
            </p>
            {selectedServiceData.ndisEnabled && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#0077B6' }}>
                ✓ This service is available for NDIS participants
              </p>
            )}
          </InfoBox>
        )}

        <FormGroup>
          <label htmlFor="firstName">First Name *</label>
          <input 
            type="text" 
            id="firstName" 
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required 
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="lastName">Last Name *</label>
          <input 
            type="text" 
            id="lastName" 
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required 
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="email">Email *</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="phone">Phone *</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required 
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="date">Preferred Date *</label>
          <input 
            type="date" 
            id="date" 
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required 
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="time">Preferred Time *</label>
          <input 
            type="time" 
            id="time" 
            name="time"
            value={formData.time}
            onChange={handleChange}
            required 
          />
        </FormGroup>

        <FormGroup>
          <CheckboxGroup>
            <input 
              type="checkbox" 
              id="ndis" 
              name="ndis"
              checked={formData.ndis}
              onChange={handleChange}
            />
            <label htmlFor="ndis">I am an NDIS participant</label>
          </CheckboxGroup>
        </FormGroup>

        {formData.ndis && (
          <FormGroup>
            <label htmlFor="ndisNumber">NDIS Number *</label>
            <input 
              type="text" 
              id="ndisNumber" 
              name="ndisNumber"
              value={formData.ndisNumber}
              onChange={handleChange}
              required={formData.ndis}
              placeholder="e.g., 43000XXXX"
            />
          </FormGroup>
        )}

        <FormGroup>
          <label htmlFor="notes">Additional Notes</label>
          <textarea 
            id="notes" 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Please let us know any specific requirements or concerns..."
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Booking Request'}
        </SubmitButton>
      </Form>

      <InfoBox style={{ marginTop: '2rem' }}>
        <strong>📞 Need Help?</strong>
        <p style={{ marginTop: '0.5rem' }}>
          If you prefer to book by phone or have any questions, please call us at{' '}
          {config.businessInfo.phone} or email {config.businessInfo.email}
        </p>
      </InfoBox>
    </Container>
  );
};

export default BookingPage;
