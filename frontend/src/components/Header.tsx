import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { TenantConfig } from '../types';

interface HeaderProps {
  config: TenantConfig;
}

const HeaderContainer = styled.header`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  a {
    color: white;
    transition: opacity 0.3s;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const Tagline = styled.p`
  text-align: center;
  max-width: 1200px;
  margin: 0.5rem auto 0;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const Header: React.FC<HeaderProps> = ({ config }) => {
  return (
    <HeaderContainer>
      <Nav>
        <Logo>
          <Link to="/">{config.name}</Link>
        </Logo>
        <NavLinks>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/booking">Book Now</Link>
          <Link to="/contact">Contact</Link>
        </NavLinks>
      </Nav>
      <Tagline>{config.branding.tagline}</Tagline>
    </HeaderContainer>
  );
};

export default Header;
