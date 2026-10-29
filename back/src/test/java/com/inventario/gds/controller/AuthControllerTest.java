package com.inventario.gds.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventario.gds.dto.request.LoginRequest;
import com.inventario.gds.entity.Rol;
import com.inventario.gds.entity.Usuario;
import com.inventario.gds.exception.GlobalExceptionHandler;
import com.inventario.gds.repository.UsuarioRepository;
import com.inventario.gds.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // --- Tests HU-01: Autenticación y Control de Roles ---

    @Test
    @DisplayName("HU-01: Login exitoso retorna HTTP 200 con token Bearer y datos de usuario")
    void login_Exitoso_RetornaTokenYDatosUsuario() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("admin123");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked.jwt.token");

        Usuario usuario = Usuario.builder()
                .id(1L)
                .username("admin")
                .nombreCompleto("Administrador Principal")
                .email("admin@stockmaster.com")
                .rol(Rol.ADMIN)
                .activo(true)
                .build();

        when(usuarioRepository.findByUsername("admin")).thenReturn(Optional.of(usuario));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.user.id").value(1))
                .andExpect(jsonPath("$.user.username").value("admin"))
                .andExpect(jsonPath("$.user.nombreCompleto").value("Administrador Principal"))
                .andExpect(jsonPath("$.user.email").value("admin@stockmaster.com"))
                .andExpect(jsonPath("$.user.rol").value("ADMIN"));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(tokenProvider).generateToken(auth);
        verify(usuarioRepository).findByUsername("admin");
    }

    @Test
    @DisplayName("HU-01: Login con credenciales incorrectas retorna HTTP 401 Unauthorized")
    void login_CredencialesInvalidas_Retorna401() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("operador");
        request.setPassword("wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("No autorizado"))
                .andExpect(jsonPath("$.message").value("Usuario o contraseña incorrectos"));

        verify(tokenProvider, never()).generateToken(any());
        verify(usuarioRepository, never()).findByUsername(any());
    }

    @Test
    @DisplayName("HU-01: Login con usuario inactivo o deshabilitado retorna HTTP 401")
    void login_UsuarioDeshabilitado_Retorna401() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("operador_baja");
        request.setPassword("operador123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new DisabledException("User is disabled"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Cuenta deshabilitada"))
                .andExpect(jsonPath("$.message").value("El usuario se encuentra inactivo en el sistema"));
    }

    @Test
    @DisplayName("HU-01: Login con usuario inexistente en BD tras auth retorna HTTP 401")
    void login_UsuarioNoEncontrado_Retorna401() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("fantasma");
        request.setPassword("password123");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked.jwt.token");
        when(usuarioRepository.findByUsername("fantasma")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Error de autenticación"));
    }

    @Test
    @DisplayName("HU-01: Login con username vacío retorna HTTP 400 Bad Request")
    void login_UsernameVacio_Retorna400BadRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("");
        request.setPassword("admin123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Error de validación de campos"))
                .andExpect(jsonPath("$.fieldErrors.username").value("El nombre de usuario es obligatorio"));

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("HU-01: Login con password vacío retorna HTTP 400 Bad Request")
    void login_PasswordVacio_Retorna400BadRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Error de validación de campos"))
                .andExpect(jsonPath("$.fieldErrors.password").value("La contraseña es obligatoria"));

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("HU-01: Login con payload totalmente vacío retorna HTTP 400 con ambos errores")
    void login_PayloadVacio_Retorna400ConAmbosErrores() throws Exception {
        LoginRequest request = new LoginRequest();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.username").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    @DisplayName("HU-01: Login para rol OPERADOR retorna perfil con rol OPERADOR")
    void login_RolOperador_RetornaRolOperador() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("operador");
        request.setPassword("operador123");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked.operador.jwt");

        Usuario operador = Usuario.builder()
                .id(2L)
                .username("operador")
                .nombreCompleto("Operador de Depósito")
                .email("operador@stockmaster.com")
                .rol(Rol.OPERADOR)
                .activo(true)
                .build();

        when(usuarioRepository.findByUsername("operador")).thenReturn(Optional.of(operador));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked.operador.jwt"))
                .andExpect(jsonPath("$.user.rol").value("OPERADOR"));
    }
}
