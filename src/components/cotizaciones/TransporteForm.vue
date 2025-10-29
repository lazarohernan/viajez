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
      <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
        <li v-for="(error, campo) in errores" :key="campo">{{ error }}</li>
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
                    name="search-origen"
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

            <!-- Campo adicional para ubicación personalizada -->
            <div v-if="origenSeleccionado === 'personalizado'" class="mt-2">
              <input
                v-model="origenPersonalizado"
                type="text"
                placeholder=""
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                :class="errores.origen ? 'border-red-500' : 'border-gray-300'"
                required
                @input="limpiarErrores"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                data-lpignore="true"
                data-form-type="other"
                name="origen-personalizado"
              />
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
                    data-form-type="other"
                    name="search-destino"
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

            <!-- Campo adicional para ubicación personalizada -->
            <div v-if="destinoSeleccionado === 'personalizado'" class="mt-2">
              <input
                v-model="destinoPersonalizado"
                type="text"
                placeholder=""
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                :class="errores.destino ? 'border-red-500' : 'border-gray-300'"
                required
                @input="limpiarErrores"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                data-lpignore="true"
                data-form-type="other"
                name="destino-personalizado"
              />
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

// Props para recibir datos iniciales al editar
const props = defineProps<{
  initialData?: Record<string, unknown> | null
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

const origenPersonalizado = ref('')
const origenSeleccionado = ref('')
const dropdownOrigenOpen = ref(false)
const busquedaOrigen = ref('')

const destinoPersonalizado = ref('')
const destinoSeleccionado = ref('')
const dropdownDestinoOpen = ref(false)
const busquedaDestino = ref('')

// Variables para manejo de errores
const errores = ref<Record<string, string>>({})
const mostrarErrores = ref(false)

// Función para limpiar errores
const limpiarErrores = () => {
  errores.value = {}
  mostrarErrores.value = false
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

const aeropuertosOrigenFiltrados = computed(() => {
  if (!busquedaOrigen.value.trim()) {
    return AEROPUERTOS // Mostrar todos los aeropuertos si no hay búsqueda
  }

  const busqueda = busquedaOrigen.value.toLowerCase()
  return AEROPUERTOS.filter(
    (aeropuerto) =>
      aeropuerto?.nombre?.toLowerCase().includes(busqueda) ||
      aeropuerto?.ciudad?.toLowerCase().includes(busqueda) ||
      aeropuerto?.codigo?.toLowerCase().includes(busqueda) ||
      aeropuerto?.pais?.toLowerCase().includes(busqueda),
  )
})

const aeropuertosDestinoFiltrados = computed(() => {
  if (!busquedaDestino.value.trim()) {
    return AEROPUERTOS // Mostrar todos los aeropuertos si no hay búsqueda
  }

  const busqueda = busquedaDestino.value.toLowerCase()
  return AEROPUERTOS.filter(
    (aeropuerto) =>
      aeropuerto?.nombre?.toLowerCase().includes(busqueda) ||
      aeropuerto?.ciudad?.toLowerCase().includes(busqueda) ||
      aeropuerto?.codigo?.toLowerCase().includes(busqueda) ||
      aeropuerto?.pais?.toLowerCase().includes(busqueda),
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

const seleccionarAeropuertoOrigen = (aeropuerto: {
  codigo: string
  nombre: string
  ciudad: string
  pais: string
}) => {
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

const seleccionarAeropuertoDestino = (aeropuerto: {
  codigo: string
  nombre: string
  ciudad: string
  pais: string
}) => {
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
  if (!formData.value.origen) {
    errores.value.origen = 'Debe especificar el origen'
  }
  if (origenSeleccionado.value === 'personalizado' && !origenPersonalizado.value.trim()) {
    errores.value.origen =
      formData.value.tipo === 'aereo'
        ? 'Debe especificar el aeropuerto de origen'
        : 'Debe especificar el lugar de origen'
  }

  // Validar destino
  if (!formData.value.destino) {
    errores.value.destino = 'Debe especificar el destino'
  }
  if (destinoSeleccionado.value === 'personalizado' && !destinoPersonalizado.value.trim()) {
    errores.value.destino =
      formData.value.tipo === 'aereo'
        ? 'Debe especificar el aeropuerto de destino'
        : 'Debe especificar el lugar de destino'
  }

  // Validar fechas
  if (!formData.value.fechaInicial) {
    errores.value.fechaInicial = 'Debe seleccionar la fecha de salida'
  }

  // Para vuelos aéreos, la fecha final es obligatoria
  if (formData.value.tipo === 'aereo' && !formData.value.fechaFinal) {
    errores.value.fechaFinal = 'Debe seleccionar la fecha de llegada'
  }

  // Validar que la fecha de llegada sea posterior a la de salida
  if (formData.value.fechaInicial && formData.value.fechaFinal) {
    const fechaSalida = new Date(formData.value.fechaInicial)
    const fechaLlegada = new Date(formData.value.fechaFinal)
    if (fechaLlegada < fechaSalida) {
      errores.value.fechaFinal = 'La fecha de llegada debe ser posterior a la fecha de salida'
    }
  }

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

// Agregar listener para cerrar dropdown
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
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
      origenPersonalizado.value = ''
      busquedaOrigen.value = ''
      dropdownOrigenOpen.value = false
      destinoSeleccionado.value = ''
      destinoPersonalizado.value = ''
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
  let origenFinal = formData.value.origen
  if (origenSeleccionado.value === 'personalizado') {
    origenFinal = origenPersonalizado.value
  }

  // Determinar el destino final
  let destinoFinal = formData.value.destino
  if (destinoSeleccionado.value === 'personalizado') {
    destinoFinal = destinoPersonalizado.value
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
