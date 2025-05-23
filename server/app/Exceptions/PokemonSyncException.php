<?php

namespace App\Exceptions;

use Exception;

class PokemonSyncException extends Exception
{
    protected string $context;

    public function __construct(string $message, string $context = '', int $code = 0, ?Exception $previous = null)
    {
        $this->context = $context;
        parent::__construct($message, $code, $previous);
    }

    public function getContext(): string
    {
        return $this->context;
    }
}

class PokemonApiException extends PokemonSyncException {}
class RateLimitException extends PokemonApiException {}
class DataProcessingException extends PokemonSyncException {}
class ConfigurationException extends PokemonSyncException {}
