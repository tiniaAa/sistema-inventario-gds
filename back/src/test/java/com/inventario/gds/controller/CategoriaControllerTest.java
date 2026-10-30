package com.inventario.gds.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventario.gds.dto.request.CategoriaRequestDTO;
import com.inventario.gds.entity.Categoria;
import com.inventario.gds.exception.GlobalExceptionHandler;
import com.inventario.gds.repository.CategoriaRepository;
import com.inventario.gds.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CategoriaControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private CategoriaController categoriaController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoriaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // --- Tests HU-06: Listado de categorías ---

    @Test
    @DisplayName("HU-06: Listar solo activas por defecto")
    void listar_SoloActivas_PorDefecto() throws Exception {
        Categoria c1 = Categoria.builder().id(1L).nombre("Herramientas").descripcion("De mano").activo(true).build();
        Categoria c2 = Categoria.builder().id(2L).nombre("Pinturas").descripcion("Látex").activo(true).build();

        when(categoriaRepository.findByActivoTrueOrderByNombreAsc()).thenReturn(Arrays.asList(c1, c2));
        when(productoRepository.countByCategoriaIdAndActivoTrue(1L)).thenReturn(5L);
        when(productoRepository.countByCategoriaIdAndActivoTrue(2L)).thenReturn(2L);

        mockMvc.perform(get("/api/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nombre").value("Herramientas"))
                .andExpect(jsonPath("$[0].cantidadProductos").value(5))
                .andExpect(jsonPath("$[1].nombre").value("Pinturas"))
                .andExpect(jsonPath("$[1].cantidadProductos").value(2));

        verify(categoriaRepository).findByActivoTrueOrderByNombreAsc();
        verify(categoriaRepository, never()).findAllByOrderByNombreAsc();
    }

    @Test
    @DisplayName("HU-06: Listar todas incluyendo inactivas cuando incluirInactivas es true")
    void listar_IncluirInactivas_True() throws Exception {
        Categoria c1 = Categoria.builder().id(1L).nombre("Herramientas").descripcion("De mano").activo(true).build();
        Categoria c2 = Categoria.builder().id(2L).nombre("Obsoletos").descripcion("Sin uso").activo(false).build();

        when(categoriaRepository.findAllByOrderByNombreAsc()).thenReturn(Arrays.asList(c1, c2));
        when(productoRepository.countByCategoriaIdAndActivoTrue(anyLong())).thenReturn(0L);

        mockMvc.perform(get("/api/categorias").param("incluirInactivas", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].activo").value(true))
                .andExpect(jsonPath("$[1].activo").value(false));

        verify(categoriaRepository).findAllByOrderByNombreAsc();
    }

    // --- Tests HU-06: Obtener por ID ---

    @Test
    @DisplayName("HU-06: Obtener categoría por ID exitosamente")
    void obtenerPorId_Exitoso() throws Exception {
        Categoria c = Categoria.builder().id(1L).nombre("Herramientas").descripcion("De mano").activo(true).build();
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(c));
        when(productoRepository.countByCategoriaIdAndActivoTrue(1L)).thenReturn(8L);

        mockMvc.perform(get("/api/categorias/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombre").value("Herramientas"))
                .andExpect(jsonPath("$.cantidadProductos").value(8));
    }

    @Test
    @DisplayName("HU-06: Obtener categoría por ID inexistente retorna 404")
    void obtenerPorId_NoExiste_404() throws Exception {
        when(categoriaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/categorias/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Recurso no encontrado"));
    }

    // --- Tests HU-06: Alta de categoría ---

    @Test
    @DisplayName("HU-06: Crear categoría exitosa (201 Created)")
    void crear_Exitoso() throws Exception {
        CategoriaRequestDTO dto = CategoriaRequestDTO.builder()
                .nombre("Electricidad")
                .descripcion("Cables e iluminación")
                .build();

        when(categoriaRepository.existsByNombreIgnoreCase("Electricidad")).thenReturn(false);
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> {
            Categoria saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.nombre").value("Electricidad"))
                .andExpect(jsonPath("$.descripcion").value("Cables e iluminación"))
                .andExpect(jsonPath("$.activo").value(true));

        verify(categoriaRepository).save(any(Categoria.class));
    }

    @Test
    @DisplayName("HU-06: Crear categoría con nombre duplicado retorna 400 Bad Request")
    void crear_NombreDuplicado_400() throws Exception {
        CategoriaRequestDTO dto = CategoriaRequestDTO.builder()
                .nombre("Herramientas")
                .descripcion("Duplicada")
                .build();

        when(categoriaRepository.existsByNombreIgnoreCase("Herramientas")).thenReturn(true);

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Ya existe una categoría registrada con el nombre: Herramientas"));

        verify(categoriaRepository, never()).save(any(Categoria.class));
    }

    @Test
    @DisplayName("HU-06: Crear categoría con nombre vacío retorna 400 Validation Error")
    void crear_NombreVacio_400() throws Exception {
        CategoriaRequestDTO dto = CategoriaRequestDTO.builder()
                .nombre("")
                .descripcion("Sin nombre")
                .build();

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.nombre").exists());

        verify(categoriaRepository, never()).save(any(Categoria.class));
    }

    @Test
    @DisplayName("HU-06: Crear categoría con nombre mayor a 50 caracteres retorna 400")
    void crear_NombreExcede50Caracteres_400() throws Exception {
        CategoriaRequestDTO dto = CategoriaRequestDTO.builder()
                .nombre("A".repeat(51))
                .descripcion("Nombre muy largo")
                .build();

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.nombre").exists());
    }

    // --- Tests HU-06: Modificación de categoría ---

    @Test
    @DisplayName("HU-06: Modificar categoría exitosamente (200 OK)")
    void actualizar_Exitoso() throws Exception {
        Categoria existing = Categoria.builder()
                .id(1L)
                .nombre("Herramientas")
                .descripcion("Vieja descripción")
                .activo(true)
                .build();

        CategoriaRequestDTO dto = CategoriaRequestDTO.builder()
                .nombre("Herramientas Pro")
                .descripcion("Nueva descripción")
                .build();

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoriaRepository.existsByNombreIgnoreCaseAndIdNot("Herramientas Pro", 1L)).thenReturn(false);
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/categorias/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Herramientas Pro"))
                .andExpect(jsonPath("$.descripcion").value("Nueva descripción"));

        verify(categoriaRepository).save(existing);
    }

    @Test
    @DisplayName("HU-06: Modificar categoría con nombre duplicado de otra retorna 400")
    void actualizar_NombreDuplicadoDeOtra_400() throws Exception {
        Categoria existing = Categoria.builder().id(1L).nombre("Herramientas").activo(true).build();
        CategoriaRequestDTO dto = CategoriaRequestDTO.builder().nombre("Pinturas").build();

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoriaRepository.existsByNombreIgnoreCaseAndIdNot("Pinturas", 1L)).thenReturn(true);

        mockMvc.perform(put("/api/categorias/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Ya existe otra categoría registrada con el nombre: Pinturas"));

        verify(categoriaRepository, never()).save(any(Categoria.class));
    }

    @Test
    @DisplayName("HU-06: Modificar categoría inexistente retorna 404")
    void actualizar_NoExiste_404() throws Exception {
        CategoriaRequestDTO dto = CategoriaRequestDTO.builder().nombre("Nueva").build();
        when(categoriaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/categorias/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // --- Tests HU-06: Baja lógica de categoría ---

    @Test
    @DisplayName("HU-06: Baja lógica exitosa (204 No Content)")
    void bajaLogica_Exitoso() throws Exception {
        Categoria existing = Categoria.builder().id(1L).nombre("Herramientas").activo(true).build();
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));

        mockMvc.perform(delete("/api/categorias/1"))
                .andExpect(status().isNoContent());

        verify(categoriaRepository).save(argThat(c -> Boolean.FALSE.equals(c.getActivo())));
    }

    @Test
    @DisplayName("HU-06: Baja lógica de categoría ya inactiva retorna 400 Bad Request")
    void bajaLogica_YaInactiva_400() throws Exception {
        Categoria existing = Categoria.builder().id(1L).nombre("Herramientas").activo(false).build();
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));

        mockMvc.perform(delete("/api/categorias/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("La categoría ya se encuentra inactiva"));

        verify(categoriaRepository, never()).save(any(Categoria.class));
    }

    @Test
    @DisplayName("HU-06: Baja lógica de categoría inexistente retorna 404")
    void bajaLogica_NoExiste_404() throws Exception {
        when(categoriaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/categorias/999"))
                .andExpect(status().isNotFound());
    }

    // --- Tests HU-06: Reactivación de categoría ---

    @Test
    @DisplayName("HU-06: Reactivar categoría exitosamente (200 OK)")
    void reactivar_Exitoso() throws Exception {
        Categoria existing = Categoria.builder().id(1L).nombre("Herramientas").activo(false).build();
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(patch("/api/categorias/1/reactivar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(true));

        verify(categoriaRepository).save(argThat(c -> Boolean.TRUE.equals(c.getActivo())));
    }

    @Test
    @DisplayName("HU-06: Reactivar categoría que ya está activa retorna 400")
    void reactivar_YaActiva_400() throws Exception {
        Categoria existing = Categoria.builder().id(1L).nombre("Herramientas").activo(true).build();
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(existing));

        mockMvc.perform(patch("/api/categorias/1/reactivar"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("La categoría ya se encuentra activa"));

        verify(categoriaRepository, never()).save(any(Categoria.class));
    }

    @Test
    @DisplayName("HU-06: Reactivar categoría inexistente retorna 404")
    void reactivar_NoExiste_404() throws Exception {
        when(categoriaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/categorias/999/reactivar"))
                .andExpect(status().isNotFound());
    }
}
