<?php

use App\Mcp\Servers\ObservabilityServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/observability', ObservabilityServer::class);
