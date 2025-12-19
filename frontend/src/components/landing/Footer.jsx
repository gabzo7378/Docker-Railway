// src/components/landing/Footer.jsx
import { Link } from 'react-router-dom';
import './LandingPage.css';

const Footer = () => {
    return (
        <footer className="landing-footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>Acerca de Nosotros</h3>
                    <p>Academia Unión de Nuevos Inteligentes - La mejor academia de preparación universitaria en Cusco. Formando a los mejores estudiantes universitarios.</p>
                </div>

                <div className="footer-section">
                    <h3>Enlaces Rápidos</h3>
                    <ul>
                        <li><Link to="/acerca-de">Acerca de</Link></li>
                        <li><Link to="/nuestros-cursos">Nuestros Cursos</Link></li>
                        <li><Link to="/docentes">Docentes</Link></li>
                        <li><Link to="/testimonios">Testimonios</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Legal</h3>
                    <ul>
                        <li><Link to="/terminos-y-condiciones">Términos y Condiciones</Link></li>
                        <li><Link to="/politica-de-privacidad">Política de Privacidad</Link></li>
                        <li><Link to="/politica-de-cookies">Política de Cookies</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contacto</h3>
                    <ul>
                        <li>📧 info@academiauni.edu.pe</li>
                        <li>📱 +51 938 865 416</li>
                        <li>📍 Lado Izquierdo Templo Sr. de Torrechayoc</li>
                    </ul>
                    <div className="social-links">
                        <a href="#facebook" aria-label="Facebook">📘</a>
                        <a href="#instagram" aria-label="Instagram">📷</a>
                        <a href="#youtube" aria-label="YouTube">📺</a>
                        <a href="#tiktok" aria-label="TikTok">🎵</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2025 Academia Unión de Nuevos Inteligentes. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
