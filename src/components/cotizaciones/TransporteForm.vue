<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <div
        class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Agregar Transporte al Viaje</h3>
      <p class="text-sm text-gray-600">
        Complete los detalles del transporte para agregar al viaje
      </p>
    </div>

    <!-- Alerta general de errores -->
    <div
      v-if="mostrarErrores && Object.keys(errores).length > 0"
      class="p-4 bg-red-50 border border-red-200 rounded-lg mb-4"
    >
      <div class="flex items-center gap-2 text-red-800">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="font-medium">Por favor, corrige los siguientes errores:</span>
      </div>
      <ul class="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
        <li v-for="(error, campo) in erroresFiltrados" :key="campo">{{ error }}</li>
      </ul>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Tipo de Transporte -->
      <div data-field="tipo">
        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Transporte</label>
        <select
          v-model="formData.tipo"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          :class="errores.tipo ? 'border-red-500' : 'border-gray-300'"
          required
          @change="limpiarErrores"
        >
          <option value="">Seleccione un tipo</option>
          <option v-for="(label, value) in ETIQUETAS_TRANSPORTE" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
        <!-- Mensaje de error -->
        <div
          v-if="mostrarErrores && errores.tipo"
          class="mt-1 text-sm text-red-600 flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          {{ errores.tipo }}
        </div>
      </div>

      <!-- Proveedor/Aerolínea (solo visible después de seleccionar tipo) -->
      <div v-if="formData.tipo" class="relative" data-field="proveedor">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ formData.tipo === 'aereo' ? 'Aerolínea' : 'Proveedor/Transporte' }}
        </label>

        <!-- Campo de selección con búsqueda (solo para aéreo) -->
        <div v-if="formData.tipo === 'aereo'" class="relative">
          <button
            type="button"
            @click="toggleDropdown"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-left flex items-center justify-between"
            :class="{ 'border-orange-500': dropdownOpen }"
          >
            <span :class="{ 'text-gray-500': !proveedorSeleccionado }">
              {{ proveedorSeleccionado || 'Seleccionar aerolínea...' }}
            </span>
            <svg
              class="w-5 h-5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': dropdownOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Dropdown con búsqueda -->
          <div
            v-if="dropdownOpen"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden"
          >
            <!-- Campo de búsqueda dentro del dropdown -->
            <div class="p-2 border-b border-gray-200">
              <div class="relative">
                <input
                  v-model="busquedaAerolinea"
                  type="text"
                  placeholder="Buscar aerolínea..."
                  class="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  @input="filtrarAerolineas"
                  ref="searchInput"
                />
                <svg
                  class="w-4 h-4 text-gray-400 absolute left-2 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <!-- Lista de aerolíneas filtradas -->
            <div class="max-h-48 overflow-y-auto">
              <!-- Opción para proveedores personalizados -->
              <button
                type="button"
                @click="seleccionarAerolineaPersonalizada"
                class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm border-b border-gray-100"
              >
                <span class="text-orange-600 font-medium">+ Otra aerolínea (especificar)</span>
              </button>

              <!-- Aerolíneas filtradas -->
              <button
                v-for="aerolinea in aerolineasFiltradas"
                :key="aerolinea.codigo"
                type="button"
                @click="seleccionarAerolinea(aerolinea)"
                class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm"
              >
                <div class="flex items-center justify-between">
                  <span>{{ aerolinea.nombre }}</span>
                  <span class="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">{{
                    aerolinea.codigo
                  }}</span>
                </div>
              </button>

              <!-- Mensaje cuando no hay resultados -->
              <div
                v-if="aerolineasFiltradas.length === 0 && busquedaAerolinea"
                class="px-3 py-2 text-sm text-gray-500 text-center"
              >
                No se encontraron aerolíneas
              </div>
            </div>
          </div>

          <!-- Campo adicional para aerolínea personalizada -->
          <div v-if="proveedorSeleccionado === 'personalizado'" class="mt-2">
            <input
              v-model="proveedorPersonalizado"
              type="text"
              placeholder="Ej: Aerolínea XYZ, LATAM, etc."
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              :class="errores.proveedor ? 'border-red-500' : 'border-gray-300'"
              required
              @input="limpiarErrores"
            />
          </div>

          <!-- Mensaje de error -->
          <div
            v-if="mostrarErrores && errores.proveedor"
            class="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {{ errores.proveedor }}
          </div>
        </div>

        <!-- Input simple para otros tipos de transporte -->
        <div v-else>
          <input
            v-model="formData.proveedor"
            type="text"
            placeholder="Ej: Nombre del proveedor o transporte"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            :class="errores.proveedor ? 'border-red-500' : 'border-gray-300'"
            required
            @input="limpiarErrores"
          />
          <p class="text-xs text-gray-500 mt-1">
            Ingresa el nombre del proveedor o servicio de transporte
          </p>
          <!-- Mensaje de error -->
          <div
            v-if="mostrarErrores && errores.proveedor"
            class="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {{ errores.proveedor }}
          </div>
        </div>
      </div>

      <!-- Origen (solo visible después de seleccionar tipo) -->
      <div v-if="formData.tipo" class="space-y-4">
        <!-- Origen -->
        <div class="relative" data-field="origen">
          <label class="block text-sm font-medium text-gray-700 mb-2">Origen</label>

          <!-- Dropdown para transporte aéreo -->
          <div v-if="formData.tipo === 'aereo'">
            <button
              type="button"
              @click="toggleDropdownOrigen"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-left flex items-center justify-between"
              :class="{ 'border-orange-500': dropdownOrigenOpen }"
              autocomplete="off"
              data-form-type="other"
            >
              <span :class="{ 'text-gray-500': !origenSeleccionado }">
                {{ origenSeleccionado || '' }}
              </span>
              <svg
                class="w-5 h-5 text-gray-400 transition-transform"
                :class="{ 'rotate-180': dropdownOrigenOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown con búsqueda -->
            <div
              v-if="dropdownOrigenOpen"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden"
            >
              <!-- Campo de búsqueda dentro del dropdown -->
              <div class="p-2 border-b border-gray-200">
                <div class="relative">
                  <input
                    v-model="busquedaOrigen"
                    type="text"
                    placeholder=""
                    class="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    @input="filtrarAeropuertosOrigen"
                    ref="searchInputOrigen"
                    autocomplete="off"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    :name="`search-origen-${Math.random()}`"
                    readonly
                    onfocus="this.removeAttribute('readonly');"
                  />
                  <svg
                    class="w-4 h-4 text-gray-400 absolute left-2 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <!-- Lista de aeropuertos filtrados -->
              <div class="max-h-48 overflow-y-auto">
                <!-- Opción para aeropuertos personalizados -->
                <button
                  type="button"
                  @click="seleccionarAeropuertoOrigenPersonalizado"
                  class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm border-b border-gray-100"
                >
                  <span class="text-orange-600 font-medium">
                    +
                    {{
                      formData.tipo === 'aereo'
                        ? 'Otro aeropuerto (especificar)'
                        : 'Otro lugar (especificar)'
                    }}
                  </span>
                </button>

                <!-- Aeropuertos filtrados -->
                <button
                  v-for="aeropuerto in aeropuertosOrigenFiltrados"
                  :key="aeropuerto.codigo"
                  type="button"
                  @click="seleccionarAeropuertoOrigen(aeropuerto)"
                  class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="font-medium">{{ aeropuerto.ciudad }}</span>
                      <span class="text-gray-500 text-xs">{{ aeropuerto.nombre }}</span>
                    </div>
                    <span class="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">{{
                      aeropuerto.codigo
                    }}</span>
                  </div>
                </button>

                <!-- Mensaje cuando no hay resultados -->
                <div
                  v-if="aeropuertosOrigenFiltrados.length === 0 && busquedaOrigen"
                  class="px-3 py-2 text-sm text-gray-500 text-center"
                >
                  No se encontraron aeropuertos
                </div>
              </div>
            </div>

            <!-- Formulario para agregar nuevo aeropuerto -->
            <div
              v-if="origenSeleccionado === 'personalizado'"
              class="mt-2 space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <p class="text-sm font-medium text-orange-900 mb-2">Agregar nuevo aeropuerto</p>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Ciudad *</label>
                <input
                  v-model="nuevoAeropuertoOrigen.ciudad"
                  type="text"
                  placeholder="Ej: San Pedro Sula"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  :class="errores.origenCiudad ? 'border-red-500' : 'border-gray-300'"
                  @input="limpiarErrores"
                  autocomplete="off"
                />
                <div v-if="errores.origenCiudad" class="mt-1 text-xs text-red-600">
                  {{ errores.origenCiudad }}
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Nombre del Aeropuerto *
                </label>
                <input
                  v-model="nuevoAeropuertoOrigen.nombre"
                  type="text"
                  placeholder="Ej: Aeropuerto Internacional Ramón Villeda Morales"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  :class="errores.origenNombre ? 'border-red-500' : 'border-gray-300'"
                  @input="limpiarErrores"
                  autocomplete="off"
                />
                <div v-if="errores.origenNombre" class="mt-1 text-xs text-red-600">
                  {{ errores.origenNombre }}
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Siglas (Código IATA) *
                </label>
                <input
                  v-model="nuevoAeropuertoOrigen.codigo"
                  type="text"
                  placeholder="Ej: SAP"
                  maxlength="3"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm uppercase"
                  :class="errores.origenCodigo ? 'border-red-500' : 'border-gray-300'"
                  @input="handleOrigenCodigoInput"
                  autocomplete="off"
                />
                <div v-if="errores.origenCodigo" class="mt-1 text-xs text-red-600">
                  {{ errores.origenCodigo }}
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  type="button"
                  @click="agregarAeropuertoOrigen"
                  class="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Agregar y Seleccionar
                </button>
                <button
                  type="button"
                  @click="cancelarAeropuertoOrigen"
                  class="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <!-- Input simple para otros tipos de transporte -->
          <div v-else>
            <input
              v-model="formData.origen"
              type="text"
              placeholder=""
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              :class="errores.origen ? 'border-red-500' : 'border-gray-300'"
              required
              @input="limpiarErrores"
              autocomplete="off"
              name="origen-transporte"
            />
          </div>

          <!-- Mensaje de error -->
          <div
            v-if="mostrarErrores && errores.origen"
            class="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {{ errores.origen }}
          </div>
        </div>

        <!-- Fecha y Hora de Salida -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Fecha de Salida -->
          <div class="relative" data-field="fechaInicial">
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Salida *</label>
            <input
              id="fechaInicial"
              v-model="formData.fechaInicial"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              :class="{ 'border-red-500': errores.fechaInicial }"
            />
            <div v-if="errores.fechaInicial" class="mt-1 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ errores.fechaInicial }}
            </div>
          </div>

          <!-- Hora de Salida -->
          <div class="relative" data-field="horaSalida">
            <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Salida *</label>
            <input
              id="horaSalida"
              v-model="formData.horaSalida"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              :class="{ 'border-red-500': errores.horaSalida }"
            />
            <div v-if="errores.horaSalida" class="mt-1 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ errores.horaSalida }}
            </div>
          </div>
        </div>

        <!-- Destino -->
        <div class="relative" data-field="destino">
          <label class="block text-sm font-medium text-gray-700 mb-2">Destino</label>

          <!-- Dropdown para transporte aéreo -->
          <div v-if="formData.tipo === 'aereo'">
            <button
              type="button"
              @click="toggleDropdownDestino"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-left flex items-center justify-between"
              :class="{ 'border-orange-500': dropdownDestinoOpen }"
              autocomplete="off"
              data-form-type="other"
            >
              <span :class="{ 'text-gray-500': !destinoSeleccionado }">
                {{ destinoSeleccionado || '' }}
              </span>
              <svg
                class="w-5 h-5 text-gray-400 transition-transform"
                :class="{ 'rotate-180': dropdownDestinoOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown con búsqueda -->
            <div
              v-if="dropdownDestinoOpen"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden"
            >
              <!-- Campo de búsqueda dentro del dropdown -->
              <div class="p-2 border-b border-gray-200">
                <div class="relative">
                  <input
                    v-model="busquedaDestino"
                    type="text"
                    placeholder=""
                    class="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    @input="filtrarAeropuertosDestino"
                    ref="searchInputDestino"
                    autocomplete="off"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    :name="`search-destino-${Math.random()}`"
                    readonly
                    onfocus="this.removeAttribute('readonly');"
                  />
                  <svg
                    class="w-4 h-4 text-gray-400 absolute left-2 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <!-- Lista de aeropuertos filtrados -->
              <div class="max-h-48 overflow-y-auto">
                <!-- Opción para aeropuertos personalizados -->
                <button
                  type="button"
                  @click="seleccionarAeropuertoDestinoPersonalizado"
                  class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm border-b border-gray-100"
                >
                  <span class="text-orange-600 font-medium">
                    +
                    {{
                      formData.tipo === 'aereo'
                        ? 'Otro aeropuerto (especificar)'
                        : 'Otro lugar (especificar)'
                    }}
                  </span>
                </button>

                <!-- Aeropuertos filtrados -->
                <button
                  v-for="aeropuerto in aeropuertosDestinoFiltrados"
                  :key="aeropuerto.codigo"
                  type="button"
                  @click="seleccionarAeropuertoDestino(aeropuerto)"
                  class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="font-medium">{{ aeropuerto.ciudad }}</span>
                      <span class="text-gray-500 text-xs">{{ aeropuerto.nombre }}</span>
                    </div>
                    <span class="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">{{
                      aeropuerto.codigo
                    }}</span>
                  </div>
                </button>

                <!-- Mensaje cuando no hay resultados -->
                <div
                  v-if="aeropuertosDestinoFiltrados.length === 0 && busquedaDestino"
                  class="px-3 py-2 text-sm text-gray-500 text-center"
                >
                  No se encontraron aeropuertos
                </div>
              </div>
            </div>

            <!-- Formulario para agregar nuevo aeropuerto -->
            <div
              v-if="destinoSeleccionado === 'personalizado'"
              class="mt-2 space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <p class="text-sm font-medium text-orange-900 mb-2">Agregar nuevo aeropuerto</p>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Ciudad *</label>
                <input
                  v-model="nuevoAeropuertoDestino.ciudad"
                  type="text"
                  placeholder="Ej: San Pedro Sula"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  :class="errores.destinoCiudad ? 'border-red-500' : 'border-gray-300'"
                  @input="limpiarErrores"
                  autocomplete="off"
                />
                <div v-if="errores.destinoCiudad" class="mt-1 text-xs text-red-600">
                  {{ errores.destinoCiudad }}
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Nombre del Aeropuerto *
                </label>
                <input
                  v-model="nuevoAeropuertoDestino.nombre"
                  type="text"
                  placeholder="Ej: Aeropuerto Internacional Ramón Villeda Morales"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  :class="errores.destinoNombre ? 'border-red-500' : 'border-gray-300'"
                  @input="limpiarErrores"
                  autocomplete="off"
                />
                <div v-if="errores.destinoNombre" class="mt-1 text-xs text-red-600">
                  {{ errores.destinoNombre }}
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Siglas (Código IATA) *
                </label>
                <input
                  v-model="nuevoAeropuertoDestino.codigo"
                  type="text"
                  placeholder="Ej: SAP"
                  maxlength="3"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm uppercase"
                  :class="errores.destinoCodigo ? 'border-red-500' : 'border-gray-300'"
                  @input="handleDestinoCodigoInput"
                  autocomplete="off"
                />
                <div v-if="errores.destinoCodigo" class="mt-1 text-xs text-red-600">
                  {{ errores.destinoCodigo }}
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  type="button"
                  @click="agregarAeropuertoDestino"
                  class="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Agregar y Seleccionar
                </button>
                <button
                  type="button"
                  @click="cancelarAeropuertoDestino"
                  class="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <!-- Input simple para otros tipos de transporte -->
          <div v-else>
            <input
              v-model="formData.destino"
              type="text"
              placeholder=""
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              :class="errores.destino ? 'border-red-500' : 'border-gray-300'"
              required
              @input="limpiarErrores"
              autocomplete="off"
              name="destino-transporte"
            />
          </div>

          <!-- Mensaje de error -->
          <div
            v-if="mostrarErrores && errores.destino"
            class="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {{ errores.destino }}
          </div>
        </div>

        <!-- Fecha y Hora de Llegada -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Fecha de Llegada -->
          <div class="relative" data-field="fechaFinal">
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Llegada *</label>
            <input
              id="fechaFinal"
              v-model="formData.fechaFinal"
              type="date"
              :required="formData.tipo === 'aereo'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              :class="{ 'border-red-500': errores.fechaFinal }"
            />
            <div v-if="errores.fechaFinal" class="mt-1 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ errores.fechaFinal }}
            </div>
          </div>

          <!-- Hora de Llegada -->
          <div class="relative" data-field="horaEntrada">
            <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Llegada *</label>
            <input
              id="horaEntrada"
              v-model="formData.horaEntrada"
              type="time"
              :required="formData.tipo === 'aereo'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              :class="{ 'border-red-500': errores.horaEntrada }"
            />
            <div v-if="errores.horaEntrada" class="mt-1 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ errores.horaEntrada }}
            </div>
          </div>
        </div>
      </div>

      <!-- Código de Reserva (solo para aéreo) -->
      <div v-if="formData.tipo === 'aereo'" data-field="codigoReserva">
        <label class="block text-sm font-medium text-gray-700 mb-2"> Código de Reserva </label>
        <input
          v-model="formData.codigoReserva"
          type="text"
          placeholder=""
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          autocomplete="off"
          name="codigo-reserva"
        />
        <p class="text-xs text-gray-500 mt-1">Código de confirmación de la aerolínea (opcional)</p>
      </div>

      <!-- Adiciones/Observaciones -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Adiciones/Observaciones
        </label>
        <textarea
          v-model="formData.observaciones"
          rows="3"
          placeholder="Detalles adicionales del servicio..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        ></textarea>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Guardar Segmento
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ETIQUETAS_TRANSPORTE } from '@/utils/constants'
import { AEROLINEAS } from '@/data/aerolineas'
import { AEROPUERTOS } from '@/data/aeropuertos'
import { AeropuertosService, type Aeropuerto } from '@/services/aeropuertos.service'

interface TransporteFormData extends Record<string, unknown> {
  tipo: string
  proveedor: string
  origen: string
  destino: string
  fechaSalida: string
  fechaEntrada: string
  fecha_inicio: string
  fecha_fin: string
  horaSalida: string
  horaEntrada: string
  codigoReserva?: string
  duracion: string
  segmento: string
  observaciones: string
}

// Props para recibir datos iniciales al editar y fechas del viaje/cotización
const props = defineProps<{
  initialData?: Record<string, unknown> | null
  fechaInicioViaje?: string | null // Fecha de inicio del viaje/cotización para validación
  fechaFinViaje?: string | null // Fecha de fin del viaje/cotización para validación
}>()

const emit = defineEmits<{
  submit: [data: TransporteFormData]
  cancel: []
}>()

// Inicializar formData con datos iniciales si existen
const formData = ref({
  tipo:
    ((props.initialData?.segmento_transporte as Record<string, unknown>)
      ?.tipo_transporte as string) || '',
  proveedor: (props.initialData?.proveedor as string) || '',
  origen:
    ((props.initialData?.segmento_transporte as Record<string, unknown>)?.origen as string) || '',
  destino:
    ((props.initialData?.segmento_transporte as Record<string, unknown>)?.destino as string) || '',
  fechaInicial: (props.initialData?.fecha_inicio as string) || '',
  fechaFinal: (props.initialData?.fecha_fin as string) || '',
  horaSalida: (props.initialData?.hora_inicio as string) || '',
  horaEntrada: (props.initialData?.hora_fin as string) || '',
  codigoReserva:
    ((props.initialData?.segmento_transporte as Record<string, unknown>)
      ?.codigo_reserva as string) || '',
  observaciones: (props.initialData?.observaciones as string) || '',
})

// console.log('🎯 TransporteForm inicializado con datos:', { initialData: props.initialData, formData: formData.value })

const proveedorPersonalizado = ref('')
const proveedorSeleccionado = ref('')
const dropdownOpen = ref(false)
const busquedaAerolinea = ref('')

const origenSeleccionado = ref('')
const dropdownOrigenOpen = ref(false)
const busquedaOrigen = ref('')
const nuevoAeropuertoOrigen = ref({
  ciudad: '',
  nombre: '',
  codigo: '',
})
const aeropuertosOrigen = ref<Aeropuerto[]>([])
const cargandoAeropuertosOrigen = ref(false)

const destinoSeleccionado = ref('')
const dropdownDestinoOpen = ref(false)
const busquedaDestino = ref('')
const nuevoAeropuertoDestino = ref({
  ciudad: '',
  nombre: '',
  codigo: '',
})
const aeropuertosDestino = ref<Aeropuerto[]>([])
const cargandoAeropuertosDestino = ref(false)

// Variables para manejo de errores
const errores = ref<Record<string, string>>({})
const mostrarErrores = ref(false)

// Función para limpiar errores
const limpiarErrores = () => {
  errores.value = {}
  mostrarErrores.value = false
}

// Funciones para manejar inputs de códigos de aeropuerto
const handleOrigenCodigoInput = () => {
  nuevoAeropuertoOrigen.value.codigo = nuevoAeropuertoOrigen.value.codigo.toUpperCase()
  limpiarErrores()
}

const handleDestinoCodigoInput = () => {
  nuevoAeropuertoDestino.value.codigo = nuevoAeropuertoDestino.value.codigo.toUpperCase()
  limpiarErrores()
}

// Watch para actualizar formData cuando cambien los initialData (al editar)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      // segmento_transporte puede venir como array o como objeto
      const segmentoTransporteRaw = newData.segmento_transporte as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | undefined

      // console.log('🔄 TransporteForm recibiendo initialData:', JSON.stringify(newData, null, 2))
      // console.log('🚗 segmento_transporte RAW:', JSON.stringify(segmentoTransporteRaw, null, 2))
      // console.log('🚗 segmento_transporte TYPE:', typeof segmentoTransporteRaw)
      // console.log('🚗 segmento_transporte IS ARRAY:', Array.isArray(segmentoTransporteRaw))

      // Si viene como array, tomar el primer elemento
      let segmentoTransporte: Record<string, unknown> | undefined = undefined
      if (Array.isArray(segmentoTransporteRaw) && segmentoTransporteRaw.length > 0) {
        segmentoTransporte = segmentoTransporteRaw[0]
        // console.log('🚗 segmento_transporte después de tomar [0]:', JSON.stringify(segmentoTransporte, null, 2))
      } else if (segmentoTransporteRaw && !Array.isArray(segmentoTransporteRaw)) {
        segmentoTransporte = segmentoTransporteRaw
      }

      const proveedor = (newData.proveedor as string) || ''
      const tipo = (segmentoTransporte?.tipo_transporte as string) || ''
      const origen = (segmentoTransporte?.origen as string) || ''
      const destino = (segmentoTransporte?.destino as string) || ''

      // console.log('📦 Datos extraídos:', { tipo, proveedor, origen, destino })

      formData.value = {
        tipo,
        proveedor,
        origen,
        destino,
        fechaInicial: (newData.fecha_inicio as string) || '',
        fechaFinal: (newData.fecha_fin as string) || '',
        horaSalida: (newData.hora_inicio as string) || '',
        horaEntrada: (newData.hora_fin as string) || '',
        codigoReserva: (segmentoTransporte?.codigo_reserva as string) || '',
        observaciones: (newData.observaciones as string) || '',
      }

      // Actualizar también proveedorSeleccionado para que el dropdown muestre el proveedor
      if (proveedor) {
        proveedorSeleccionado.value = proveedor
        // console.log('📦 Proveedor seleccionado en dropdown:', proveedor)
      }

      // Actualizar origenSeleccionado y destinoSeleccionado para que se muestren en los dropdowns
      if (origen) {
        // Extraer solo la parte resumida (ciudad y código) del valor completo
        const matchOrigen = origen.match(/^(.+?)\s*\(([A-Z]{3})\)/)
        if (matchOrigen) {
          origenSeleccionado.value = `${matchOrigen[1]} (${matchOrigen[2]})`
        } else {
          origenSeleccionado.value = origen
        }
      }

      if (destino) {
        // Extraer solo la parte resumida (ciudad y código) del valor completo
        const matchDestino = destino.match(/^(.+?)\s*\(([A-Z]{3})\)/)
        if (matchDestino) {
          destinoSeleccionado.value = `${matchDestino[1]} (${matchDestino[2]})`
        } else {
          destinoSeleccionado.value = destino
        }
      }

      // console.log('✅ TransporteForm actualizado con nuevos datos:', JSON.stringify(formData.value, null, 2))
    } else {
      // console.log('❌ TransporteForm recibió initialData null/undefined')
    }
  },
  { immediate: true },
)

// Filtrar errores para mostrar solo los principales en la alerta general
// Ocultar errores específicos de campos que ya tienen error general
const erroresFiltrados = computed(() => {
  const erroresMostrar: Record<string, string> = {}

  // Campos específicos que no deben mostrarse en la alerta general (solo en campos individuales)
  const camposEspecificos = [
    'origenCiudad',
    'origenNombre',
    'origenCodigo',
    'destinoCiudad',
    'destinoNombre',
    'destinoCodigo',
  ]

  Object.keys(errores.value).forEach((campo) => {
    // Excluir campos específicos de la alerta general (se muestran debajo de cada campo)
    if (camposEspecificos.includes(campo)) {
      return
    }

    // Agregar el error a la alerta general
    erroresMostrar[campo] = errores.value[campo]
  })

  return erroresMostrar
})

const aerolineasFiltradas = computed(() => {
  if (!busquedaAerolinea.value.trim()) {
    return AEROLINEAS // Mostrar todas las aerolíneas si no hay búsqueda
  }

  const busqueda = busquedaAerolinea.value.toLowerCase()
  return AEROLINEAS.filter(
    (aerolinea) =>
      aerolinea.nombre.toLowerCase().includes(busqueda) ||
      aerolinea.codigo.toLowerCase().includes(busqueda),
  )
})

// Combinar aeropuertos estáticos con los de BD
const aeropuertosCombinadosOrigen = computed(() => {
  // Convertir AEROPUERTOS estáticos al formato de Aeropuerto de BD
  const aeropuertosEstaticos = AEROPUERTOS.map((ap) => ({
    id: `static-${ap.codigo}`,
    ciudad: ap.ciudad || '',
    nombre: ap.nombre || '',
    codigo: ap.codigo || '',
    pais: ap.pais || '',
  }))

  // Combinar con aeropuertos de BD (evitar duplicados por código)
  const codigosExistentes = new Set(aeropuertosEstaticos.map((ap) => ap.codigo))
  const aeropuertosBD = (aeropuertosOrigen.value || []).filter(
    (ap) => !codigosExistentes.has(ap.codigo),
  )

  return [...aeropuertosEstaticos, ...aeropuertosBD]
})

const aeropuertosCombinadosDestino = computed(() => {
  // Convertir AEROPUERTOS estáticos al formato de Aeropuerto de BD
  const aeropuertosEstaticos = AEROPUERTOS.map((ap) => ({
    id: `static-${ap.codigo}`,
    ciudad: ap.ciudad || '',
    nombre: ap.nombre || '',
    codigo: ap.codigo || '',
    pais: ap.pais || '',
  }))

  // Combinar con aeropuertos de BD (evitar duplicados por código)
  const codigosExistentes = new Set(aeropuertosEstaticos.map((ap) => ap.codigo))
  const aeropuertosBD = (aeropuertosDestino.value || []).filter(
    (ap) => !codigosExistentes.has(ap.codigo),
  )

  return [...aeropuertosEstaticos, ...aeropuertosBD]
})

const aeropuertosOrigenFiltrados = computed(() => {
  const aeropuertos = aeropuertosCombinadosOrigen.value

  if (!busquedaOrigen.value.trim()) {
    return aeropuertos // Mostrar todos los aeropuertos si no hay búsqueda
  }

  const busqueda = busquedaOrigen.value.toLowerCase()
  return aeropuertos.filter(
    (aeropuerto) =>
      aeropuerto?.nombre?.toLowerCase().includes(busqueda) ||
      aeropuerto?.ciudad?.toLowerCase().includes(busqueda) ||
      aeropuerto?.codigo?.toLowerCase().includes(busqueda) ||
      (aeropuerto as { pais?: string })?.pais?.toLowerCase().includes(busqueda),
  )
})

const aeropuertosDestinoFiltrados = computed(() => {
  const aeropuertos = aeropuertosCombinadosDestino.value

  if (!busquedaDestino.value.trim()) {
    return aeropuertos // Mostrar todos los aeropuertos si no hay búsqueda
  }

  const busqueda = busquedaDestino.value.toLowerCase()
  return aeropuertos.filter(
    (aeropuerto) =>
      aeropuerto?.nombre?.toLowerCase().includes(busqueda) ||
      aeropuerto?.ciudad?.toLowerCase().includes(busqueda) ||
      aeropuerto?.codigo?.toLowerCase().includes(busqueda) ||
      (aeropuerto as { pais?: string })?.pais?.toLowerCase().includes(busqueda),
  )
})

// Funciones para el dropdown
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    // Enfocar el input de búsqueda cuando se abre
    nextTick(() => {
      const searchInput = document.querySelector(
        'input[placeholder="Buscar aerolínea..."]',
      ) as HTMLInputElement
      if (searchInput) searchInput.focus()
    })
  }
}

const filtrarAerolineas = () => {
  // La lógica de filtrado está en el computed aerolineasFiltradas
}

const seleccionarAerolinea = (aerolinea: { codigo: string; nombre: string }) => {
  const valorCompleto = `${aerolinea.nombre} (${aerolinea.codigo})`
  proveedorSeleccionado.value = valorCompleto
  formData.value.proveedor = valorCompleto
  dropdownOpen.value = false
  busquedaAerolinea.value = ''
}

const seleccionarAerolineaPersonalizada = () => {
  proveedorSeleccionado.value = 'personalizado'
  formData.value.proveedor = 'personalizado'
  dropdownOpen.value = false
  busquedaAerolinea.value = ''
}

// Funciones para dropdowns de aeropuertos
const toggleDropdownOrigen = () => {
  dropdownOrigenOpen.value = !dropdownOrigenOpen.value
  if (dropdownOrigenOpen.value) {
    nextTick(() => {
      const searchInput = document.querySelector('input[name="search-origen"]') as HTMLInputElement
      if (searchInput) searchInput.focus()
    })
  }
}

const toggleDropdownDestino = () => {
  dropdownDestinoOpen.value = !dropdownDestinoOpen.value
  if (dropdownDestinoOpen.value) {
    nextTick(() => {
      const searchInput = document.querySelector('input[name="search-destino"]') as HTMLInputElement
      if (searchInput) searchInput.focus()
    })
  }
}

const seleccionarAeropuertoOrigen = (
  aeropuerto: Aeropuerto | { codigo: string; nombre: string; ciudad: string; pais?: string },
) => {
  // Solo resumir texto para transporte aéreo, otros transportes muestran texto completo
  const textoResumido =
    formData.value.tipo === 'aereo'
      ? `${aeropuerto.ciudad} (${aeropuerto.codigo})`
      : `${aeropuerto.ciudad} - ${aeropuerto.nombre}`

  // Valor completo para guardar en la base de datos
  const valorCompleto =
    formData.value.tipo === 'aereo'
      ? `${aeropuerto.ciudad} (${aeropuerto.codigo}) - ${aeropuerto.nombre}`
      : `${aeropuerto.ciudad} - ${aeropuerto.nombre}`

  origenSeleccionado.value = textoResumido
  formData.value.origen = valorCompleto
  dropdownOrigenOpen.value = false
  busquedaOrigen.value = ''
}

const seleccionarAeropuertoDestino = (
  aeropuerto: Aeropuerto | { codigo: string; nombre: string; ciudad: string; pais?: string },
) => {
  // Solo resumir texto para transporte aéreo, otros transportes muestran texto completo
  const textoResumido =
    formData.value.tipo === 'aereo'
      ? `${aeropuerto.ciudad} (${aeropuerto.codigo})`
      : `${aeropuerto.ciudad} - ${aeropuerto.nombre}`

  // Valor completo para guardar en la base de datos
  const valorCompleto =
    formData.value.tipo === 'aereo'
      ? `${aeropuerto.ciudad} (${aeropuerto.codigo}) - ${aeropuerto.nombre}`
      : `${aeropuerto.ciudad} - ${aeropuerto.nombre}`

  destinoSeleccionado.value = textoResumido
  formData.value.destino = valorCompleto
  dropdownDestinoOpen.value = false
  busquedaDestino.value = ''
}

const seleccionarAeropuertoOrigenPersonalizado = () => {
  origenSeleccionado.value = 'personalizado'
  formData.value.origen = 'personalizado'
  dropdownOrigenOpen.value = false
  busquedaOrigen.value = ''
}

const seleccionarAeropuertoDestinoPersonalizado = () => {
  destinoSeleccionado.value = 'personalizado'
  formData.value.destino = 'personalizado'
  dropdownDestinoOpen.value = false
  busquedaDestino.value = ''
}

const filtrarAeropuertosOrigen = () => {
  // La lógica de filtrado está en el computed aeropuertosOrigenFiltrados
}

const filtrarAeropuertosDestino = () => {
  // La lógica de filtrado está en el computed aeropuertosDestinoFiltrados
}

// Funciones de validación
const validarFormulario = (): boolean => {
  errores.value = {}
  mostrarErrores.value = true

  // Validar tipo de transporte
  if (!formData.value.tipo) {
    errores.value.tipo = 'Debe seleccionar un tipo de transporte'
  }

  // Validar proveedor (para todos los tipos de transporte)
  if (!proveedorSeleccionado.value && !formData.value.proveedor) {
    errores.value.proveedor =
      formData.value.tipo === 'aereo'
        ? 'Debe seleccionar una aerolínea'
        : 'Debe especificar un proveedor'
  }
  if (proveedorSeleccionado.value === 'personalizado' && !proveedorPersonalizado.value.trim()) {
    errores.value.proveedor =
      formData.value.tipo === 'aereo'
        ? 'Debe especificar el nombre de la aerolínea'
        : 'Debe especificar el nombre del proveedor'
  }

  // Validar origen
  if (origenSeleccionado.value === 'personalizado') {
    // Si está en modo personalizado, validar que se complete el formulario
    const tieneErroresAeropuerto =
      !nuevoAeropuertoOrigen.value.ciudad.trim() ||
      !nuevoAeropuertoOrigen.value.nombre.trim() ||
      !nuevoAeropuertoOrigen.value.codigo.trim() ||
      nuevoAeropuertoOrigen.value.codigo.trim().length !== 3

    // Solo mostrar errores específicos en los campos, NO en la alerta general
    if (!nuevoAeropuertoOrigen.value.ciudad.trim()) {
      errores.value.origenCiudad = 'La ciudad es requerida'
    }
    if (!nuevoAeropuertoOrigen.value.nombre.trim()) {
      errores.value.origenNombre = 'El nombre del aeropuerto es requerido'
    }
    if (!nuevoAeropuertoOrigen.value.codigo.trim()) {
      errores.value.origenCodigo = 'El código IATA es requerido'
    } else if (nuevoAeropuertoOrigen.value.codigo.trim().length !== 3) {
      errores.value.origenCodigo = 'El código IATA debe tener 3 letras'
    }

    // Solo agregar error general si hay errores (se filtra en erroresFiltrados)
    if (tieneErroresAeropuerto) {
      errores.value.origen = 'Complete todos los campos del formulario de nuevo aeropuerto'
    }
  } else if (!formData.value.origen) {
    // Si no está en modo personalizado pero no hay origen seleccionado
    errores.value.origen = 'Debe especificar el origen'
  }

  // Validar destino
  if (destinoSeleccionado.value === 'personalizado') {
    // Si está en modo personalizado, validar que se complete el formulario
    const tieneErroresAeropuerto =
      !nuevoAeropuertoDestino.value.ciudad.trim() ||
      !nuevoAeropuertoDestino.value.nombre.trim() ||
      !nuevoAeropuertoDestino.value.codigo.trim() ||
      nuevoAeropuertoDestino.value.codigo.trim().length !== 3

    // Solo mostrar errores específicos en los campos, NO en la alerta general
    if (!nuevoAeropuertoDestino.value.ciudad.trim()) {
      errores.value.destinoCiudad = 'La ciudad es requerida'
    }
    if (!nuevoAeropuertoDestino.value.nombre.trim()) {
      errores.value.destinoNombre = 'El nombre del aeropuerto es requerido'
    }
    if (!nuevoAeropuertoDestino.value.codigo.trim()) {
      errores.value.destinoCodigo = 'El código IATA es requerido'
    } else if (nuevoAeropuertoDestino.value.codigo.trim().length !== 3) {
      errores.value.destinoCodigo = 'El código IATA debe tener 3 letras'
    }

    // Solo agregar error general si hay errores (se filtra en erroresFiltrados)
    if (tieneErroresAeropuerto) {
      errores.value.destino = 'Complete todos los campos del formulario de nuevo aeropuerto'
    }
  } else if (!formData.value.destino) {
    // Si no está en modo personalizado pero no hay destino seleccionado
    errores.value.destino = 'Debe especificar el destino'
  }

  // Validar fechas
  if (!formData.value.fechaInicial) {
    errores.value.fechaInicial = 'Debe seleccionar la fecha de salida'
  }

  // Para vuelos aéreos, la fecha final es obligatoria
  if (formData.value.tipo === 'aereo' && !formData.value.fechaFinal) {
    errores.value.fechaFinal = 'Debe seleccionar la fecha de llegada'
  }

  // Validar que las fechas estén dentro del rango del viaje/cotización
  if (props.fechaInicioViaje && props.fechaFinViaje) {
    const fechaInicioViaje = new Date(props.fechaInicioViaje + 'T00:00:00')
    const fechaFinViaje = new Date(props.fechaFinViaje + 'T23:59:59')

    // Validar fecha de salida
    if (formData.value.fechaInicial) {
      const fechaInicioSegmento = new Date(formData.value.fechaInicial + 'T00:00:00')

      if (fechaInicioSegmento < fechaInicioViaje) {
        errores.value.fechaInicial = `La fecha de salida no puede ser anterior al inicio del viaje (${props.fechaInicioViaje})`
      } else if (fechaInicioSegmento > fechaFinViaje) {
        errores.value.fechaInicial = `La fecha de salida no puede ser posterior al fin del viaje (${props.fechaFinViaje})`
      }
    }

    // Validar fecha de llegada
    if (formData.value.fechaFinal) {
      const fechaFinSegmento = new Date(formData.value.fechaFinal + 'T23:59:59')

      if (fechaFinSegmento < fechaInicioViaje) {
        errores.value.fechaFinal = `La fecha de llegada no puede ser anterior al inicio del viaje (${props.fechaInicioViaje})`
      } else if (fechaFinSegmento > fechaFinViaje) {
        errores.value.fechaFinal = `La fecha de llegada no puede ser posterior al fin del viaje (${props.fechaFinViaje})`
      }
    }
  } else {
    // Si solo tenemos una fecha límite, validar individualmente
    if (props.fechaInicioViaje && formData.value.fechaInicial) {
      const fechaInicioViaje = new Date(props.fechaInicioViaje + 'T00:00:00')
      const fechaInicioSegmento = new Date(formData.value.fechaInicial + 'T00:00:00')

      if (fechaInicioSegmento < fechaInicioViaje) {
        errores.value.fechaInicial = `La fecha de salida no puede ser anterior al inicio del viaje (${props.fechaInicioViaje})`
      }
    }

    if (props.fechaFinViaje && formData.value.fechaInicial) {
      const fechaFinViaje = new Date(props.fechaFinViaje + 'T23:59:59')
      const fechaInicioSegmento = new Date(formData.value.fechaInicial + 'T00:00:00')

      if (fechaInicioSegmento > fechaFinViaje) {
        errores.value.fechaInicial = `La fecha de salida no puede ser posterior al fin del viaje (${props.fechaFinViaje})`
      }
    }

    if (props.fechaInicioViaje && formData.value.fechaFinal) {
      const fechaInicioViaje = new Date(props.fechaInicioViaje + 'T00:00:00')
      const fechaFinSegmento = new Date(formData.value.fechaFinal + 'T23:59:59')

      if (fechaFinSegmento < fechaInicioViaje) {
        errores.value.fechaFinal = `La fecha de llegada no puede ser anterior al inicio del viaje (${props.fechaInicioViaje})`
      }
    }

    if (props.fechaFinViaje && formData.value.fechaFinal) {
      const fechaFinViaje = new Date(props.fechaFinViaje + 'T23:59:59')
      const fechaFinSegmento = new Date(formData.value.fechaFinal + 'T23:59:59')

      if (fechaFinSegmento > fechaFinViaje) {
        errores.value.fechaFinal = `La fecha de llegada no puede ser posterior al fin del viaje (${props.fechaFinViaje})`
      }
    }
  }

  // VALIDACIÓN REMOVIDA: Permitir que la fecha de llegada sea el mismo día o incluso anterior
  // Esto es útil para vuelos que salen de noche y llegan temprano al día siguiente
  // o vuelos que salen y llegan el mismo día

  // Validar que la fecha de llegada no sea anterior a la de salida
  // COMENTADO: Se removió esta validación para permitir fechas de mismo día
  // if (formData.value.fechaInicial && !formData.value.tieneRetorno && formData.value.fechaFinal) {
  //   const fechaSalida = new Date(formData.value.fechaInicial)
  //   const fechaLlegada = new Date(formData.value.fechaFinal)
  //   if (fechaLlegada < fechaSalida) {
  //     errores.value.fechaFinal = 'La fecha de llegada no puede ser anterior a la fecha de salida'
  //   }
  // }

  // Validar horas
  if (!formData.value.horaSalida) {
    errores.value.horaSalida = 'Debe especificar la hora de salida'
  }

  // Hora de llegada es requerida para vuelos aéreos
  if (formData.value.tipo === 'aereo' && !formData.value.horaEntrada) {
    errores.value.horaEntrada = 'Debe especificar la hora de llegada'
  }

  return Object.keys(errores.value).length === 0
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement

  // Verificar si el click fue dentro de algún dropdown
  const proveedorDropdown = target.closest('[data-field="proveedor"]')
  const origenDropdown = target.closest('[data-field="origen"]')
  const destinoDropdown = target.closest('[data-field="destino"]')

  // Solo cerrar dropdowns si el click fue fuera de todos ellos
  if (!proveedorDropdown && !origenDropdown && !destinoDropdown) {
    dropdownOpen.value = false
    busquedaAerolinea.value = ''
    dropdownOrigenOpen.value = false
    busquedaOrigen.value = ''
    dropdownDestinoOpen.value = false
    busquedaDestino.value = ''
  }
}

// Cargar aeropuertos desde datos estáticos y base de datos
const cargarAeropuertos = async () => {
  try {
    cargandoAeropuertosOrigen.value = true
    cargandoAeropuertosDestino.value = true

    const { data, error } = await AeropuertosService.getAll()

    if (error) {
      // Si hay error, mostrar mensaje pero continuar con aeropuertos estáticos
      console.warn('⚠️ Error al cargar aeropuertos:', error)
      return
    }

    if (data) {
      aeropuertosOrigen.value = data
      aeropuertosDestino.value = data
    }
  } catch (error) {
    // Capturar cualquier error y continuar con aeropuertos estáticos
    console.warn('⚠️ Error al cargar aeropuertos:', error)
  } finally {
    cargandoAeropuertosOrigen.value = false
    cargandoAeropuertosDestino.value = false
  }
}

// Función para agregar nuevo aeropuerto desde origen
const agregarAeropuertoOrigen = async () => {
  // Limpiar errores previos
  delete errores.value.origenCiudad
  delete errores.value.origenNombre
  delete errores.value.origenCodigo
  delete errores.value.origen
  mostrarErrores.value = false

  // Validar campos
  if (!nuevoAeropuertoOrigen.value.ciudad.trim()) {
    errores.value.origenCiudad = 'La ciudad es requerida'
    mostrarErrores.value = true
    return
  }
  if (!nuevoAeropuertoOrigen.value.nombre.trim()) {
    errores.value.origenNombre = 'El nombre del aeropuerto es requerido'
    mostrarErrores.value = true
    return
  }
  if (!nuevoAeropuertoOrigen.value.codigo.trim()) {
    errores.value.origenCodigo = 'El código IATA es requerido'
    mostrarErrores.value = true
    return
  }
  if (nuevoAeropuertoOrigen.value.codigo.trim().length !== 3) {
    errores.value.origenCodigo = 'El código IATA debe tener exactamente 3 letras'
    mostrarErrores.value = true
    return
  }

  try {
    const { data, error } = await AeropuertosService.create(
      nuevoAeropuertoOrigen.value.ciudad.trim(),
      nuevoAeropuertoOrigen.value.nombre.trim(),
      nuevoAeropuertoOrigen.value.codigo.trim().toUpperCase(),
    )

    if (error) {
      errores.value.origenCodigo = error
      errores.value.origen = error
      mostrarErrores.value = true
      return
    }

    if (data) {
      // Limpiar errores al tener éxito
      delete errores.value.origenCiudad
      delete errores.value.origenNombre
      delete errores.value.origenCodigo
      delete errores.value.origen

      // Agregar a la lista local
      aeropuertosOrigen.value.push(data)

      // Seleccionar el aeropuerto recién creado
      seleccionarAeropuertoOrigen(data)

      // Limpiar formulario
      nuevoAeropuertoOrigen.value = {
        ciudad: '',
        nombre: '',
        codigo: '',
      }
    }
  } catch (error) {
    console.error('Error agregando aeropuerto:', error)
    errores.value.origenCodigo =
      'Error inesperado al agregar el aeropuerto. Por favor, intenta nuevamente.'
    errores.value.origen =
      'Error inesperado al agregar el aeropuerto. Por favor, intenta nuevamente.'
    mostrarErrores.value = true
  }
}

// Función para cancelar agregar aeropuerto desde origen
const cancelarAeropuertoOrigen = () => {
  nuevoAeropuertoOrigen.value = {
    ciudad: '',
    nombre: '',
    codigo: '',
  }
  origenSeleccionado.value = ''
  formData.value.origen = ''
  delete errores.value.origenCiudad
  delete errores.value.origenNombre
  delete errores.value.origenCodigo
}

// Función para agregar nuevo aeropuerto desde destino
const agregarAeropuertoDestino = async () => {
  // Limpiar errores previos
  delete errores.value.destinoCiudad
  delete errores.value.destinoNombre
  delete errores.value.destinoCodigo
  delete errores.value.destino
  mostrarErrores.value = false

  // Validar campos
  if (!nuevoAeropuertoDestino.value.ciudad.trim()) {
    errores.value.destinoCiudad = 'La ciudad es requerida'
    mostrarErrores.value = true
    return
  }
  if (!nuevoAeropuertoDestino.value.nombre.trim()) {
    errores.value.destinoNombre = 'El nombre del aeropuerto es requerido'
    mostrarErrores.value = true
    return
  }
  if (!nuevoAeropuertoDestino.value.codigo.trim()) {
    errores.value.destinoCodigo = 'El código IATA es requerido'
    mostrarErrores.value = true
    return
  }
  if (nuevoAeropuertoDestino.value.codigo.trim().length !== 3) {
    errores.value.destinoCodigo = 'El código IATA debe tener exactamente 3 letras'
    mostrarErrores.value = true
    return
  }

  try {
    const { data, error } = await AeropuertosService.create(
      nuevoAeropuertoDestino.value.ciudad.trim(),
      nuevoAeropuertoDestino.value.nombre.trim(),
      nuevoAeropuertoDestino.value.codigo.trim().toUpperCase(),
    )

    if (error) {
      errores.value.destinoCodigo = error
      errores.value.destino = error
      mostrarErrores.value = true
      return
    }

    if (data) {
      // Limpiar errores al tener éxito
      delete errores.value.destinoCiudad
      delete errores.value.destinoNombre
      delete errores.value.destinoCodigo
      delete errores.value.destino

      // Agregar a la lista local
      aeropuertosDestino.value.push(data)

      // Seleccionar el aeropuerto recién creado
      seleccionarAeropuertoDestino(data)

      // Limpiar formulario
      nuevoAeropuertoDestino.value = {
        ciudad: '',
        nombre: '',
        codigo: '',
      }
    }
  } catch (error) {
    console.error('Error agregando aeropuerto:', error)
    errores.value.destinoCodigo =
      'Error inesperado al agregar el aeropuerto. Por favor, intenta nuevamente.'
    errores.value.destino =
      'Error inesperado al agregar el aeropuerto. Por favor, intenta nuevamente.'
    mostrarErrores.value = true
  }
}

// Función para cancelar agregar aeropuerto desde destino
const cancelarAeropuertoDestino = () => {
  nuevoAeropuertoDestino.value = {
    ciudad: '',
    nombre: '',
    codigo: '',
  }
  destinoSeleccionado.value = ''
  formData.value.destino = ''
  delete errores.value.destinoCiudad
  delete errores.value.destinoNombre
  delete errores.value.destinoCodigo
}

// Agregar listener para cerrar dropdown y cargar aeropuertos
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await cargarAeropuertos()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const duracionCalculada = computed(() => {
  if (formData.value.fechaInicial && formData.value.fechaFinal) {
    const inicio = new Date(formData.value.fechaInicial)
    const fin = new Date(formData.value.fechaFinal)
    const diffTime = Math.abs(fin.getTime() - inicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '0 días'
    if (diffDays === 1) return '1 día'

    // Calcular horas y minutos si es necesario
    const hours = Math.floor(diffTime / (1000 * 60 * 60))
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffDays} días (${hours} horas, ${minutes} minutos)`
  }
  return ''
})

// Limpiar valores cuando cambie el tipo de transporte
watch(
  () => formData.value.tipo,
  (nuevoTipo) => {
    // Si cambió el tipo, limpiar todos los dropdowns para evitar inconsistencias
    if (nuevoTipo) {
      proveedorSeleccionado.value = ''
      proveedorPersonalizado.value = ''
      busquedaAerolinea.value = ''
      dropdownOpen.value = false
      formData.value.proveedor = ''
      origenSeleccionado.value = ''
      nuevoAeropuertoOrigen.value = {
        ciudad: '',
        nombre: '',
        codigo: '',
      }
      busquedaOrigen.value = ''
      dropdownOrigenOpen.value = false
      destinoSeleccionado.value = ''
      nuevoAeropuertoDestino.value = {
        ciudad: '',
        nombre: '',
        codigo: '',
      }
      busquedaDestino.value = ''
      dropdownDestinoOpen.value = false
      formData.value.origen = ''
      formData.value.destino = ''
      formData.value.codigoReserva = ''
    }
  },
)

const handleSubmit = () => {
  // Validar formulario antes de enviar
  if (!validarFormulario()) {
    // Scroll al primer error
    const primerError = Object.keys(errores.value)[0]
    if (primerError) {
      const elemento = document.querySelector(`[data-field="${primerError}"]`)
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    return
  }

  // Determinar el proveedor final
  let proveedorFinal = proveedorSeleccionado.value || formData.value.proveedor

  // Si es personalizado, usar el valor del input personalizado
  if (proveedorFinal === 'personalizado') {
    proveedorFinal = proveedorPersonalizado.value
  }

  // Determinar el origen final
  const origenFinal = formData.value.origen
  // Si el origen es "personalizado", significa que el usuario no completó el formulario de nuevo aeropuerto
  // En ese caso, ya debería haberse validado antes de llegar aquí, pero verificamos nuevamente por seguridad
  if (origenSeleccionado.value === 'personalizado') {
    // Verificar que el origen no sea 'personalizado' (debe ser un valor real del aeropuerto agregado)
    if (origenFinal === 'personalizado' || !origenFinal) {
      errores.value.origen =
        'Debe completar el formulario de nuevo aeropuerto y hacer clic en "Agregar y Seleccionar" o seleccionar un aeropuerto existente'
      return
    }
  }

  // Determinar el destino final
  const destinoFinal = formData.value.destino
  // Si el destino es "personalizado", significa que el usuario no completó el formulario de nuevo aeropuerto
  // En ese caso, ya debería haberse validado antes de llegar aquí, pero verificamos nuevamente por seguridad
  if (destinoSeleccionado.value === 'personalizado') {
    // Verificar que el destino no sea 'personalizado' (debe ser un valor real del aeropuerto agregado)
    if (destinoFinal === 'personalizado' || !destinoFinal) {
      errores.value.destino =
        'Debe completar el formulario de nuevo aeropuerto y hacer clic en "Agregar y Seleccionar" o seleccionar un aeropuerto existente'
      return
    }
  }

  // Limpiar errores antes de enviar
  limpiarErrores()

  emit('submit', {
    ...formData.value,
    proveedor: proveedorFinal,
    fechaSalida: formData.value.fechaInicial || '',
    fechaEntrada: formData.value.fechaFinal || '',
    fecha_inicio: formData.value.fechaInicial || '',
    fecha_fin: formData.value.fechaFinal || '',
    horaEntrada: formData.value.horaEntrada || '',
    duracion: duracionCalculada.value || '',
    segmento: 'Transporte',
    origen: origenFinal || '',
    destino: destinoFinal || '',
  } as TransporteFormData)
}
</script>
