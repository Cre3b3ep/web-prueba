---
title: "Inteligencia artificial"
borrador: true
permalink: /ia/
eleventyExcludeFromCollections: true
---
<!--
  PENDIENTE DE TU TEXTO. Portada de la sección. Mapa de cómo se relacionan los conceptos:
  IA  >  aprendizaje automático  >  aprendizaje profundo  >  IA generativa  >  LLM
  RAG y agentes NO son ramas nuevas: son formas de USAR un LLM.
-->

<h1 class="texto-centro">{{ title }}</h1>

<ol>
{%- for p in collections.ia | sort(attribute='data.orden') %}
  <li><a href="{{ p.url }}">{{ p.data.title }}</a></li>
{%- endfor %}
</ol>
